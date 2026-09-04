"""Regression checks for public output cleanup and validation before mutation."""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class BuildTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'src', self.root / 'src')
        shutil.copytree(ROOT / 'scripts', self.root / 'scripts')
        (self.root / 'dist').mkdir()
        (self.root / 'dist/stale.js').write_text('old output')

    def build(self):
        return subprocess.run([sys.executable, '-O', str(self.root / 'scripts/build.py')],
                              capture_output=True, text=True)

    def test_stale_files_are_removed(self):
        result = self.build()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.root / 'dist/stale.js').exists())
        self.assertTrue((self.root / 'dist/js/app.js').is_file())
        self.assertFalse((self.root / 'dist/logo-options.html').exists())

    def test_invalid_anchor_preserves_previous_output(self):
        page = self.root / 'src/index.html'
        page.write_text(page.read_text() + '<a href="#missing">Invalid</a>')
        result = self.build()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Broken section link', result.stderr)
        self.assertTrue((self.root / 'dist/stale.js').exists())


if __name__ == '__main__':
    unittest.main()
