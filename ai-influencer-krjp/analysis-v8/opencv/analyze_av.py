#!/usr/bin/env python3
"""Reproducible OpenCV/FFmpeg measurements, NOT semantic/watch analysis."""
import argparse,csv,json,math,hashlib,subprocess,datetime
from pathlib import Path
import cv2
import numpy as np
def run(args): return subprocess.run(args,check=True,capture_output=True)
def dump(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2,allow_nan=False))
def db(x): return round(20*math.log10(max(float(x),1e-12)),3)
def grouped(rows,key,minimum=0.0):
 result=[];start=None
 for r in rows+[{'start_s':rows[-1]['end_s'],'end_s':rows[-1]['end_s'],key:False}]:
  if r[key] and start is None:start=r['start_s']
  if not r[key] and start is not None:
   if r['start_s']-start>=minimum-1e-6:result.append({'start_s':start,'end_s':r['start_s'],'duration_s':round(r['start_s']-start,4)})
   start=None
 return result
def main():
 a=argparse.ArgumentParser();a.add_argument('input');a.add_argument('--id',required=True);a.add_argument('--out',required=True);args=a.parse_args()
 src=Path(args.input);out=Path(args.out)/args.id;out.mkdir(parents=True,exist_ok=True)
 probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(src)]).stdout)
 dump(out/'ffprobe.json',probe)
 vs=next(x for x in probe['streams'] if x['codec_type']=='video')
 timing=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(src)]).stdout)['frames']
 times=[float(x['best_effort_timestamp_time']) for x in timing]
 t0=times[0];times=[t-t0 for t in times]
 duration=round(times[-1]+float(np.median(np.diff(times))),6)
 container_duration=float(probe['format']['duration'])
 cap=cv2.VideoCapture(str(src));frames=[];cuts=[];prevgray=None;prevhist=None;previous_candidate=-10
 width=180; height=round(int(vs['height'])*width/int(vs['width']))
 for i,t in enumerate(times):
  ok,bgr=cap.read()
  if not ok:break
  bgr=cv2.resize(bgr,(width,height),interpolation=cv2.INTER_AREA)
  gray=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY);hsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)
  hist=cv2.calcHist([hsv],[0,1],None,[32,32],[0,180,0,256]);cv2.normalize(hist,hist)
  mad=float(np.mean(cv2.absdiff(gray,prevgray))) if prevgray is not None else 0
  bh=float(cv2.compareHist(prevhist,hist,cv2.HISTCMP_BHATTACHARYYA)) if prevhist is not None else 0
  candidate=((bh>=.35 and mad>=25) or mad>=65) and t-previous_candidate>=.15
  if candidate:
   cuts.append({'time_s':round(t,6),'nearest_0_1_s':round(t,1),'frame_index':i,'hist_bhattacharyya':round(bh,5),'gray_mad':round(mad,4),'status':'automatic_candidate_unverified'});previous_candidate=t
  frames.append({'t':t,'bgr':bgr,'gray':gray,'mad':mad,'bh':bh})
  prevgray=gray;prevhist=hist
 cap.release()
 if len(frames)!=len(times): raise RuntimeError('Decode count differs from ffprobe frame count')
 dump(out/'cut-candidates.json',cuts)
 has_audio=any(x['codec_type']=='audio' for x in probe['streams'])
 audio=np.frombuffer(run(['ffmpeg','-v','error','-i',str(src),'-vn','-ac','1','-ar','16000','-f','f32le','pipe:1']).stdout,dtype='<f4') if has_audio else None
 audio_start=float(next(x for x in probe['streams'] if x['codec_type']=='audio').get('start_time',0)) if has_audio else 0
 audio_offset=t0-audio_start
 rows=[];prev=None;prev_fft=None;fi=0
 for k in range(math.ceil(duration*10)):
  start=round(k/10,1);end=min(round((k+1)/10,1),duration)
  while fi+1<len(frames) and frames[fi+1]['t']<=start+1e-7:fi+=1
  f=frames[fi];bgr=f['bgr'];gray=f['gray'];hsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)
  if prev is not None and fi!=prev['index']:
   flow=cv2.calcOpticalFlowFarneback(prev['gray'],gray,None,.5,3,15,3,5,1.2,0)
   mag=np.linalg.norm(flow,axis=2);p75=float(np.percentile(mag,75));dx,dy=np.median(flow,axis=(0,1))
  else:p75=0;dx=0;dy=0
  r={'start_s':start,'end_s':round(end,6),'sample_source_pts_s':round(f['t'],6),'sample_frame_index':fi,'luma_gray_mean_0_255':round(float(gray.mean()),3),'hsv_saturation_mean_0_255':round(float(hsv[:,:,1].mean()),3),'highlight_pixels_pct_gray_ge245':round(float((gray>=245).mean()*100),3),'shadow_pixels_pct_gray_le16':round(float((gray<=16).mean()*100),3),'flow_p75_px_per_sample_at180w':round(p75,4),'flow_median_dx':round(float(dx),4),'flow_median_dy':round(float(dy),4),'cut_candidates_in_bin':sum(start<=c['time_s']<end for c in cuts),'audio_rms_dbfs':None,'audio_sample_peak_dbfs':None,'audio_spectral_centroid_hz':None,'positive_spectral_flux':None,'below_minus45_dbfs':False}
  if audio is not None:
   chunk=audio[max(0,round((start+audio_offset)*16000)):max(0,round((end+audio_offset)*16000))]
   if len(chunk):
    rms=np.sqrt(np.mean(chunk.astype(np.float64)**2));pk=np.max(np.abs(chunk));fft=np.abs(np.fft.rfft(chunk*np.hanning(len(chunk)),n=2048));freq=np.fft.rfftfreq(2048,1/16000);energy=fft.sum();norm=fft/max(float(energy),1e-12)
    r.update(audio_rms_dbfs=db(rms),audio_sample_peak_dbfs=db(pk),audio_spectral_centroid_hz=round(float((fft*freq).sum()/max(float(energy),1e-12)),2),positive_spectral_flux=round(float(np.maximum(norm-prev_fft,0).sum()) if prev_fft is not None else 0,6),below_minus45_dbfs=bool(db(rms)<=-45))
    prev_fft=norm
  rows.append(r);prev={'index':fi,'gray':gray}
 with (out/'timeline-0.1s.csv').open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
 dump(out/'timeline-0.1s.json',rows)
 silence=grouped(rows,'below_minus45_dbfs',.2) if has_audio else []
 dump(out/'low-level-audio-intervals.json',silence)
 summary={'id':args.id,'source_path':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'analyzed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'duration_s':duration,'resolution':[vs['width'],vs['height']],'fps_average':vs.get('avg_frame_rate'),'decoded_video_frames':len(frames),'timeline_bins':len(rows),'has_audio':has_audio,'automatic_cut_candidates':len(cuts),'cut_candidates_status':'NOT verified shot count','below_minus45_dbfs_intervals_minimum_0_2s':len(silence),'below_minus45_dbfs_total_duration_s':round(sum(x['duration_s'] for x in silence),4),'audio_semantics':'SFX identities, speech and music not inferred from RMS/spectral metrics','limits':['0.1s bins are measurement granularity, not semantic annotation precision.','Cuts may be missed or false-positive on flashes, camera movement and crossfades.','Dense optical flow mixes subject motion and camera motion and does not prove lens/camera settings.','No automatic object/character/text detection performed.','SFX, captions, expression changes, transitions and playback-speed events require separate viewing/listening validation.','No original edit speed inferred from observed motion.'],'tool_versions':{'opencv':cv2.__version__,'numpy':np.__version__,'ffmpeg':run(['ffmpeg','-version']).stdout.decode().splitlines()[0]},'status':'PASS_measured_not_watch_validated'}
 summary.update(container_duration_s=container_duration,video_first_source_pts_s=t0,audio_first_source_pts_s=audio_start,audio_samples_offset_for_video_zero_s=audio_offset,timeline_time_origin='First decoded VIDEO frame PTS = 0; audio windows shifted by video/audio start offset. Video endpoint estimated using final PTS plus median frame interval.')
 dump(out/'summary.json',summary)
 print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':main()
