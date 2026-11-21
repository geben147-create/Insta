#!/usr/bin/env python3
"""Link the installed global watch skill into existing Hermes profiles, safely."""
from pathlib import Path
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone

GLOBAL = Path('/home/yh/.hermes/skills/media/watch')
ROOTS = {
    'Codex': Path('/home/yh/.codex/skills/watch'),
    'Claude': Path('/home/yh/.claude/skills/watch'),
    'Hermes': GLOBAL,
}
OUT = Path(__file__).resolve().parent

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def tree(root):
    return {str(p.relative_to(root)): sha(p) for p in sorted(root.rglob('*'))
            if p.is_file() and '__pycache__' not in p.parts and p.suffix != '.pyc'}

def run(args):
    proc = subprocess.run(args, text=True, capture_output=True, timeout=90)
    return proc

if not (GLOBAL / 'SKILL.md').is_file():
    raise SystemExit('Installed global Hermes watch is missing; no links created.')

reference = tree(GLOBAL)
roots = []
for label, root in ROOTS.items():
    help_run = run(['python3', str(root / 'scripts/watch.py'), '--help'])
    setup_run = run(['python3', str(root / 'scripts/setup.py'), '--json'])
    setup = {}
    parsed = False
    try:
        raw = json.loads(setup_run.stdout)
        allowed = ['can_proceed', 'first_run', 'engine', 'configured_engine',
                   'binaries_required', 'missing_binaries', 'backend_ready',
                   'whisperx_ready', 'whisperx_bin', 'whisperx_model']
        setup = {key: raw[key] for key in allowed if key in raw}
        parsed = True
    except (ValueError, TypeError):
        pass
    roots.append({
        'host': label, 'path': str(root),
        'skill_sha256': sha(root / 'SKILL.md') if (root / 'SKILL.md').is_file() else None,
        'all_skill_files_match_global': tree(root) == reference,
        'help_exit_code': help_run.returncode,
        'help_usage_present': 'usage:' in help_run.stdout.lower(),
        'setup_exit_code': setup_run.returncode,
        'setup_json_parsed': parsed, 'setup_selected_fields': setup,
    })

profiles = []
for skills in sorted(Path('/home/yh/.hermes/profiles').glob('*/skills')):
    if not skills.is_dir():
        continue
    destination = skills / 'watch'
    changed = False
    if not os.path.lexists(destination):
        destination.symlink_to(GLOBAL, target_is_directory=True)
        changed = True
        action = 'created_symlink'
    elif destination.is_symlink() and destination.resolve() == GLOBAL.resolve():
        action = 'already_shared'
    else:
        action = 'existing_path_preserved'
    readable = (destination / 'SKILL.md').is_file() and os.access(destination / 'SKILL.md', os.R_OK)
    profiles.append({
        'profile': skills.parent.name, 'path': str(destination),
        'action': action, 'changed': changed, 'is_symlink': destination.is_symlink(),
        'resolved_path': str(destination.resolve()), 'skill_readable': readable,
        'skill_sha256': sha(destination / 'SKILL.md') if readable else None,
        'all_skill_files_match_global': tree(destination) == reference if readable else False,
    })

result = {
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'roots': roots, 'profiles': profiles,
    'profile_count': len(profiles),
    'new_links': sum(p['changed'] for p in profiles),
    'all_profiles_share_global': all(p['is_symlink'] and p['resolved_path'] == str(GLOBAL.resolve())
                                     and p['skill_readable'] and p['all_skill_files_match_global'] for p in profiles),
    'all_roots_equal': all(p['all_skill_files_match_global'] for p in roots),
    'all_root_help_pass': all(p['help_exit_code'] == 0 and p['help_usage_present'] for p in roots),
    'all_root_setup_pass': all(p['setup_exit_code'] == 0 and p['setup_json_parsed'] for p in roots),
    'build_video_development_course': 'NOT_INSTALLED: public distribution not found; no substitute skill installed under that name.',
    'limits': [
        'Filesystem sharing and CLI preflight only; no evidence of a completed watch run in each host app.',
        'No paid API calls, ASR model downloads, or global shell environment changes performed.',
        'No existing profile watch path overwritten; future new profiles need the same link step.',
        'App skill discovery or currently running app refresh not tested.',
    ],
}
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'watch-shared-install-verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(json.dumps({key: result[key] for key in ['profile_count', 'new_links', 'all_profiles_share_global',
                                             'all_roots_equal', 'all_root_help_pass', 'all_root_setup_pass']},
                 ensure_ascii=False))
