#!/usr/bin/env python3
"""Original, sample-free SFX30 synthesis. Requires NumPy and FFmpeg/libmp3lame."""
import argparse
from pathlib import Path
import shutil
import subprocess

import numpy as np

SR = 48_000
NAMES = (
    'Cartoon Blinking', 'Gasp', 'Pop Cartoon', 'Mouth Pop', 'Abrupt Record Scratch',
    'Cinematic Boom', 'Dramatic Hit', 'Record Scratch', 'Reward Chime', 'Level Up',
    'Magic Sparkle', 'Arcade Achievement Bling', 'Whoosh Transition', 'Professional Transition',
    'Ukulele Whoosh', 'Radio Static', 'Digital Beep', 'Clock Ticking', 'Mouse Click',
    'Keyboard Typing (Report)', 'Sword Slash and Swing', 'Hard Punch', 'Sword Slash with Metallic Impact',
    'News Transition', 'Camera Shutter', 'Message Notification', 'Keyboard Typing (Comment)',
    'Page Flip', 'Notification Bell', 'Pop In',
)
DUR = (.34,.48,.32,.24,.58,1.06,.93,.58,.85,.94,.82,.76,.56,.72,.40,.51,.28,1.12,.17,.90,.53,.34,.76,1.04,.26,.64,.98,.48,.78,.47)


def time(d):
    return np.arange(round(d * SR)) / SR


def sine(f, t):
    return np.sin(2 * np.pi * (f * t if np.ndim(f) == 0 else np.cumsum(f) / SR))


def sweep(t, a, b, tau):
    return sine(b + (a - b) * np.exp(-t / tau), t)


def env(t, attack, decay):
    return -np.expm1(-t / attack) * np.exp(-t / decay)


def swell(t, middle, left, right):
    return np.exp(-((t - middle) / np.where(t < middle, left, right)) ** 2)


def noise(t, rng, lo, hi):
    """Band-shaped noise, with smooth skirts instead of a brickwall filter."""
    x = rng.standard_normal(len(t))
    hz = np.fft.rfftfreq(len(x), 1 / SR)
    shape = (1 - np.exp(-(hz / lo)**2)) * np.exp(-(hz / hi)**4)
    y = np.fft.irfft(np.fft.rfft(x) * shape, n=len(x))
    return y / max(1e-8, y.std())


def modes(t, base, partials):
    return sum(amp * sine(base * ratio, t) * env(t, .0014, tau)
               for ratio, amp, tau in partials)


def render(i):
    rng = np.random.default_rng(381000 + i)
    t = time(DUR[i - 1])
    out = np.zeros_like(t)
    # ±1 is hard pan; the center keeps identical L/R and folds down cleanly.
    side = np.zeros_like(t)

    def add(x, at: float = 0, gain: float = 1, pan: float = 0):
        start = round(at * SR)
        x = x[:len(t) - start] * gain
        end = start + len(x)
        out[start:end] += x
        side[start:end] += pan * .48 * x

    def n(s, lo, hi):
        return noise(s, rng, lo, hi)

    def ping(at, f, gain: float = 1, pan: float = 0, style='glass'):
        s = time(.52)
        parts = {'glass': [(1,1,.15),(2.006,.24,.076),(3.014,.12,.042),(4.19,.09,.026)],
                 'bell': [(1,1,.22),(2.43,.32,.12),(3.61,.2,.075),(5.03,.12,.039)],
                 'bit': [(1,1,.095),(3,.27,.061),(5,.12,.043),(7,.05,.025)]}[style]
        add(modes(s, f, parts), at, gain, pan)

    def click(at, body, snap, f, gain: float = 1, pan: float = 0):
        s = time(.07)
        x = snap * n(s, 2300, 10000) * env(s,.00022,.0016)
        x += body * (sine(f,s) + .25*sine(f*2.7,s)) * env(s,.00035,.006)
        add(x, at, gain, pan)

    def air(mid, left, right, lo, hi, gain: float = 1, pan: float = 0):
        add(n(t,lo,hi) * swell(t,mid,left,right), gain=gain, pan=pan)

    if i == 1:  # two fluttering cartoon eyelid chirps
        for at, f, g in [(.024,1580,1),(.145,1890,.83)]:
            s = time(.11)
            add((sweep(s, f, 570,.026) + .22*sweep(s,f*1.9,980,.022))*env(s,.004,.026),at,g)
            click(at+.001,.13,.4,1340,.48)
    elif i == 2:  # glottal catch and sharply inhaled vowel; no voice recording
        click(.021,.25,.22,690,.42)
        breath = n(t,420,5700) * .32 + n(t,850,1480) * .39 + n(t,2200,3450) * .18
        breath *= (1 + .15*sine(27,t)) * swell(t,.14,.050,.117)
        add(breath)
        add((sweep(t,410,216,.12)+.34*sweep(t,830,432,.12))*swell(t,.123,.041,.065),gain=.20)
    elif i == 3:  # rounded, pitched cartoon bubble popping up
        s = time(.27)
        f = 315 + 860 * (1-np.exp(-s/.009)) * np.exp(-s/.044)
        add((sine(f,s) + .21*sine(f*2.03,s))*env(s,.002,.049),.015)
        click(.020,.16,.48,2130,.47)
    elif i == 4:  # dry, unpitched lip suction and release
        s = time(.16)
        add(n(s,1000,3900)*swell(s,.031,.016,.010),.006,.15)
        add((sweep(s,603,148,.010)+.20*sweep(s,1800,460,.008))*env(s,.0009,.019),.038)
        click(.039,.20,.42,860,.67)
    elif i == 5:  # hard vinyl brake, one long downward scrape
        s = time(.52)
        f = 835*np.exp(-s/.132) + 45 + 26*sine(20,s)
        x = np.tanh(2.5*sine(f,s)) + .36*sine(2.14*f,s)
        grit = n(s,750,8500) * (.6 + .4*sine(41,s)**2)
        add((x*.62+grit*.45)*env(s,.0014,.123),.030)
        click(.029,.44,.92,790,.86)
        click(.435,.18,.23,370,.48)
    elif i == 6:  # distant LF pressure wave plus diffused rubble
        add(sweep(t,105,36,.048)*env(t,.007,.18),.024)
        add(sweep(t,180,64,.058)*env(t,.004,.09),.025,.30)
        air(.071,.055,.239,52,460,.39)
        air(.03,.012,.095,290,2200,.17,.21)
    elif i == 7:  # close trailer accent: drums, discordant stab and short reflections
        s = time(.65)
        add((sweep(s,188,68,.032)+.32*sweep(s,310,100,.028))*env(s,.002,.091),.022)
        add(n(s,170,5200)*env(s,.001,.036),.024,.43)
        for j,f in enumerate([144,153,220,311]):
            add(np.tanh(2*sine(f,s))*env(s,.007,.136),.028,.14,(-1)**j*.61)
        add(n(s,270,2100)*env(s,.012,.125),.169,.17,-.71)
    elif i == 8:  # short back-and-forth DJ scratches; not a brake
        for k,(at,d,a,b,direction) in enumerate([(.021,.13,210,1060,1),(.162,.16,975,195,-1),(.333,.15,250,915,1)]):
            s = time(d)
            f = a + (b-a)*(s/d)**.77 + 20*sine(26,s)
            x = (.6*np.tanh(2.9*sine(f,s)) + .37*n(s,1200,8600)) * np.sin(np.pi*s/d)**1.25
            add(x,at,1-k*.13,direction*.32)
            click(at+d-.026,.18,.31,710,.51)
    elif i == 9:  # ascending, warm mallet arpeggio, soft octave cap
        for at,f,g,p in [(.018,523.25,1,-.32),(.117,659.26,.87,.19),(.216,783.99,.79,.36),(.307,1046.5,.63,.05)]:
            ping(at,f,g,p)
        ping(.307,523.25,.30,-.24)
    elif i == 10:  # broad rising level-up cadence, PWM bass into wide major voicing
        for j,f in enumerate([329.63,415.30,493.88,659.25]):
            s = time(.12)
            ph = sine(f,s) + .32*sine(f*1.995,s)
            add(np.tanh(ph*1.6)*env(s,.004,.045),.016+j*.086,1,(-1)**j*.39)
        for f,p in [(329.63,0),(523.25,-.42),(659.25,.42),(987.77,.11)]:
            s = time(.56)
            add((.74*sine(f,s)+.26*sine(f*2,s))*env(s,.009,.145),.36,.45,p)
    elif i == 11:  # scattered high glass particles, not a pitched fanfare
        for j in range(23):
            at=.018 + j*.019 + rng.uniform(0,.024)
            s=time(.24)
            f=rng.uniform(1350,4200)*(1+.65*j/23)
            add(modes(s,f,[(1,1,.034),(1.61,.21,.018)]),at,rng.uniform(.15,.52)*(1-j*.027),rng.uniform(-1,1))
        air(.17,.10,.25,1750,8800,.08,.55)
    elif i == 12:  # bright 8-bit achievement triplet and two-note resolve
        for j,(at,f) in enumerate([(.013,587.33),(.091,880),(.168,1174.66),(.264,1318.51),(.264,1760)]):
            ping(at,f,.85 if j<3 else .53,(-1)**j*.26,'bit')
        ping(.391,880,.24,-.7,'bit')
    elif i == 13:  # smooth sweep across frame, soft exit, no hit
        air(.209,.111,.126,210,1700,.69,-.63)
        air(.253,.097,.138,890,4900,.31,.69)
        add(sine(102 + 1700*t**1.48,t)*swell(t,.211,.108,.146),gain=.20)
    elif i == 14:  # reverse build into a punchy tonal cut point at ~0.35 s
        air(.337,.158,.023,140,3900,.65,-.47)
        add(sine(98+1700*t**2,t)*swell(t,.338,.143,.022),gain=.37,pan=.54)
        s=time(.35)
        add(sweep(s,149,51,.036)*env(s,.003,.080),.346,1)
        add(n(s,900,6100)*env(s,.002,.043),.348,.36,.35)
    elif i == 15:  # compact naturalistic wooden swing past the mic (not a strum)
        air(.125,.057,.055,205,1450,.68,-.41)
        air(.145,.059,.041,890,3900,.30,.39)
        add(modes(t,247,[(1,1,.105),(2.41,.43,.081),(4.07,.24,.043)])*swell(t,.148,.065,.096),gain=.22)
    elif i == 16:  # FM tuning noise, irregular squelch bursts
        for at,d in [(.016,.144),(.186,.073),(.275,.149),(.443,.044)]:
            s=time(d)
            gate=np.clip(np.sin(np.pi*s/d)*2.4,0,1) * (.73+.27*sine(96,s))
            add((n(s,500,6900)*.76+.22*sweep(s,1480,427,.036))*gate,at,rng.uniform(.59,1))
            for p in rng.uniform(.008,d*.9,3):
                click(at+p,.11,.60,800,.58)
    elif i == 17:  # clean instrument-style confirmation pulse with subtle octave
        for at,d,g,f in [(.015,.078,1,1160),(.124,.097,.78,1540)]:
            s=time(d)
            gate=np.minimum(1,s/.003)*np.minimum(1,(d-s)/.012)
            add((sine(f,s)+.17*sine(f*2,s))*gate,at,g)
    elif i == 18:  # regular alternating tick/tock mechanical escapement
        for j,at in enumerate([.028,.278,.528,.778,1.028]):
            k=j%2
            click(at,.67,.49,1270-470*k,1-.11*k,-.10+.20*k)
            click(at+.012,.26,.18,520-90*k,.63)
    elif i == 19:  # short down/up leaf switch, centered and dry
        click(.016,.73,.91,2180)
        click(.074,.46,.64,1699,.73)
    elif i == 20:  # clacky keyboard: steady typing plus a heavier final key
        for j,at in enumerate([.019,.102,.182,.263,.381,.468,.586,.674,.784]):
            f=rng.uniform(410,850) if j<8 else 320
            click(at,.9,.68,f,rng.uniform(.67,1),rng.uniform(-.76,.76))
            click(at+rng.uniform(.020,.043),.29,.45,f*1.48,.61)
    elif i == 21:  # free swing: narrow high swish with a short blade whisper, no collision
        air(.174,.087,.055,1010,8200,.71,-.50)
        air(.220,.044,.109,2250,9600,.39,.76)
        s=time(.29)
        add(sweep(s,3800,1180,.054)*env(s,.011,.073),.176,.17,.42)
    elif i == 22:  # close punch: dry skin slap over chest/body thud
        s=time(.30)
        add(sweep(s,160,47,.028)*env(s,.0018,.054),.055)
        add(n(s,240,1520)*env(s,.0007,.026),.053,.50)
        add(n(s,1800,6600)*env(s,.00030,.007),.051,.44)
        air(.036,.018,.019,290,1700,.17)
    elif i == 23:  # slash into a clang with separated ringing resonances
        air(.136,.066,.024,1200,8200,.51,-.63)
        s=time(.63)
        add(modes(s,680,[(1,1,.153),(1.66,.60,.118),(2.92,.49,.095),(4.39,.31,.068),(6.41,.19,.043)]),.153,.73,.18)
        add(n(s,1250,9400)*env(s,.0005,.035),.153,.48,.45)
        add(sweep(s,203,83,.021)*env(s,.001,.069),.153,.47)
    elif i == 24:  # percussive broadcast bumper: custom syncopated synth brass + drum
        for at,f,g in [(.022,293.66,.88),(.147,349.23,.86),(.236,440,.93),(.399,392,1),(.582,293.66,1)]:
            s=time(.49)
            osc = sine(f,s)+.36*sine(2*f,s)+.18*sine(3*f,s)+.09*sine(4*f,s)
            add(np.tanh(osc*1.2)*env(s,.008,.059 if at<.5 else .137),at,g)
            add(sweep(s,122,49,.028)*env(s,.002,.062),at,.32)
            click(at,.20,.42,1000,.69,.26)
        ping(.582,587.33,.22,-.44)
    elif i == 25:  # mirror slap, small shutter motor chatter, return slap
        click(.023,.68,.61,730)
        s=time(.14)
        add(n(s,1150,7200)*(.51+.49*sine(116,s)**2)*env(s,.003,.026),.028,.58)
        click(.086,.48,.67,1230,.87)
        click(.126,.34,.51,850,.61)
    elif i == 26:  # rounded two-note message tone descending a third
        for at,f,g in [(.014,987.77,1),(.109,830.61,.80)]:
            s=time(.49)
            add((sine(f,s)+.25*sine(f*2,s)+.065*sine(f*3.01,s))*env(s,.008,.118),at,g)
    elif i == 27:  # laptop comment taps: quick clusters, gaps, final enter
        for j,at in enumerate([.017,.053,.091,.131,.178,.331,.374,.405,.457,.496,.553,.692,.739,.848]):
            f=rng.uniform(900,1700) if j<13 else 690
            click(at,.39,.90,f,rng.uniform(.52,.93),rng.uniform(-.64,.64))
            if j in (4,10,13):
                click(at+.021,.25,.54,f*.83,.76)
    elif i == 28:  # finger grab, curling paper flutter, paper landing on stack
        click(.032,.28,.41,1060,.43)
        air(.114,.042,.065,430,5200,.43,-.24)
        add(n(t,950,6300)*swell(t,.196,.068,.061)*(.56+.44*sine(48,t)**2),gain=.49,pan=.42)
        air(.268,.048,.047,290,2200,.50,.25)
        click(.291,.45,.33,640,.48)
    elif i == 29:  # single struck notification bell with inharmonic tail
        ping(.023,1174.66,1,.02,'bell')
        s=time(.74)
        add(modes(s,588,[(1,1,.25),(2.011,.22,.18)]),.024,.23,-.28)
        click(.023,.16,.42,1790,.42)
    elif i == 30:  # tiny intake followed by a soft, resonant UI entrance
        air(.065,.032,.033,340,2900,.37,-.28)
        s=time(.34)
        add((sweep(s,653,272,.035)+.24*sweep(s,1320,591,.033))*env(s,.003,.063),.105,1)
        add(sweep(s,235,166,.064)*env(s,.012,.069),.131,.43,.30)
        add(n(s,1100,4200)*env(s,.003,.025),.099,.17)
    else:
        raise ValueError(f'No such SFX ID: {i}')

    stereo = np.column_stack((out - side, out + side))
    stereo -= stereo.mean(axis=0)
    for d, view in [(.005,stereo[:240]), (.028,stereo[-1344:][::-1])]:
        view *= np.sin(np.pi / 2 * np.linspace(0, 1, round(d*SR)))[:,None]**2
    # Keep transient headroom, and leave scene-specific gain to the editor.
    peak = 10 ** ((-6 if i in (2,11,16,18,20,27,28) else -4) / 20)
    stereo *= peak / np.max(np.abs(stereo))
    return stereo.astype('<f4')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('ids', nargs='*', type=int, metavar='ID', help='default: all 30')
    p.add_argument('--wav', action='store_true', help='also write 24-bit PCM masters')
    p.add_argument('--out', type=Path, default=Path(__file__).resolve().parent)
    args = p.parse_args()
    ids = args.ids or range(1,31)
    if any(i not in range(1,31) for i in ids):
        p.error('ID must be 1–30')
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        p.error('ffmpeg is required')
    args.out.mkdir(parents=True, exist_ok=True)
    for i in dict.fromkeys(ids):
        pcm = render(i).tobytes()
        targets = [('mp3', ['-c:a','libmp3lame','-b:a','192k'])]
        if args.wav:
            targets.append(('wav', ['-c:a','pcm_s24le']))
        for suffix, opts in targets:
            target = args.out / f'{i:02}.{suffix}'
            subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-f','f32le',
                            '-ar',str(SR),'-ac','2','-i','pipe:0',*opts,
                            '-metadata',f'title=SFX30 {i:02} - {NAMES[i-1]}',
                            '-metadata','comment=Original procedural synthesis; no external samples',
                            str(target)], input=pcm, check=True)
        print(f'{i:02}  {DUR[i-1]:.2f}s  {NAMES[i-1]}')


if __name__ == '__main__':
    main()
