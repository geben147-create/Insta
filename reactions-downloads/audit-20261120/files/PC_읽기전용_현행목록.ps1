param(
 [string]$Source='C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션',
 [string]$OutputParent=(Join-Path $env:USERPROFILE 'Downloads')
)
$ErrorActionPreference='Stop'
if(-not (Test-Path -LiteralPath $Source -PathType Container)){throw "Source unavailable: $Source"}
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$out=Join-Path $OutputParent "PC-870-Inventory-$stamp"
if(Test-Path -LiteralPath $out){throw "Refusing existing output: $out"}
New-Item -ItemType Directory -Path $out | Out-Null
$extensions=@('.mp4','.mkv','.webm','.mov','.m4v','.flv','.srt','.vtt')
$files=@(Get-ChildItem -LiteralPath $Source -Recurse -File -ErrorAction Stop | Where-Object {$extensions -contains $_.Extension.ToLowerInvariant()})
$rows=foreach($file in $files){
 $id='UNKNOWN'
 $m=[regex]::Match($file.Name,'BV[A-Za-z0-9]{10}|(?:XHS)?[a-fA-F0-9]{24}|(?<![0-9])[0-9]{18,20}(?![0-9])|VIDE[A-Za-z0-9]{20,40}|8JiyJejo-e0')
 if($m.Success){$id=$m.Value;if($id.StartsWith('XHS')){$id=$id.Substring(3).ToLowerInvariant()}}
 $before=Get-Item -LiteralPath $file.FullName
 $hash='UNKNOWN';$status='UNKNOWN';$errorText='UNKNOWN'
 try{
  $hash=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  $after=Get-Item -LiteralPath $file.FullName
  if($before.Length -eq $after.Length -and $before.LastWriteTimeUtc.Ticks -eq $after.LastWriteTimeUtc.Ticks){$status='STABLE'}else{$status='CHANGED_DURING_HASH'}
 }catch{$status='READ_ERROR';$errorText=$_.Exception.Message}
 [pscustomobject]@{ID=$id;path=$file.FullName;bytes=$before.Length;sha256=$hash;extension=$file.Extension;mtime_utc=$before.LastWriteTimeUtc.ToString('o');hash_status=$status;error=$errorText}
}
$target=Join-Path $out 'PC-current-inventory.tsv'
$rows | Export-Csv -LiteralPath $target -Delimiter "`t" -NoTypeInformation -Encoding UTF8 -NoClobber
[pscustomobject]@{source=$Source;captured=(Get-Date).ToString('o');file_count=@($rows).Count;inventory=$target;original_files_modified=$false} | ConvertTo-Json | Out-File -LiteralPath (Join-Path $out 'summary.json') -Encoding UTF8 -NoClobber
Write-Output "Inventory: $target"
Write-Output 'Original files were not deleted or modified. This script does not transfer files or inspect subtitle quality.'
