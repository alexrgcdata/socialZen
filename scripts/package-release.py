"""Package the reviewed public source and buildless extension; no dependencies needed."""
import hashlib
import json
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent.parent
FILES = (
    '.gitignore', 'README.md', 'manifest.json', 'content.js', 'keywords.js',
    'popup.html', 'popup.js', 'installation-guide.html',
    'assets/socialzen-icon.png', 'assets/socialzen-logo.svg',
    'demo/chrome-stub.js', 'demo/index.html', 'demo/socialzen-demo.jpg',
    'package.json', 'package-lock.json', 'tests/filter.test.cjs',
    'scripts/package-release.py',
)

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    if git('status', '--porcelain'):
        raise SystemExit('Commit or resolve checkout changes before packaging.')
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    version = manifest['version']
    if not version or any(c not in '0123456789.' for c in version):
        raise SystemExit('Expected a numeric extension version.')
    package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
    lock = json.loads((ROOT / 'package-lock.json').read_text(encoding='utf-8'))
    assert package['version'] == lock['version'] == lock['packages']['']['version'] == version
    assert len(manifest['description']) <= 132
    resources = [manifest['action']['default_popup'], manifest['action']['default_icon']]
    resources += list(manifest['icons'].values())
    resources += [p for group in manifest['content_scripts'] for p in group['js']]
    resources += [p for group in manifest['web_accessible_resources'] for p in group['resources']]
    assert set(resources).issubset(FILES), 'Manifest resource missing from the allow-list'
    # Read committed blobs to avoid Windows newline conversion changing the ZIP.
    blobs = {}
    for name in FILES:
        path = ROOT / name
        assert not path.is_symlink() and path.resolve().is_relative_to(ROOT) and path.is_file(), name
        blobs[name] = subprocess.check_output(['git', 'show', 'HEAD:' + name], cwd=ROOT)
    output = ROOT / 'release'
    output.mkdir(exist_ok=True)
    target = output / ('socialzen-' + version + '.zip')
    prefix = 'socialzen-' + version + '/'
    with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
        for name, data in blobs.items():
            entry = ZipInfo(prefix + name, date_time=(2020, 1, 1, 0, 0, 0))
            entry.compress_type = ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data)
    with ZipFile(target) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == {prefix + name for name in FILES}
        for name, data in blobs.items():
            assert archive.read(prefix + name) == data, name
    digest = sha(target.read_bytes())
    receipt = {
        'version': version, 'commit': git('rev-parse', 'HEAD'), 'archive': target.name,
        'bytes': target.stat().st_size, 'sha256': digest,
        'files': {name: {'bytes': len(data), 'sha256': sha(data)} for name, data in blobs.items()},
        'acceptance': 'Synthetic DOM tests only; native installation, real popup storage, and signed-in Facebook unverified.',
    }
    target.with_suffix('.sha256').write_text(digest + '  ' + target.name + '\n', encoding='utf-8')
    target.with_suffix('.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in receipt.items() if k != 'files'}, indent=2))

if __name__ == '__main__':
    main()
