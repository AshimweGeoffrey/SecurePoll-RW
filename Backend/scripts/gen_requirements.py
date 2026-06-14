"""Generate requirements.txt from pyproject.toml."""
from pathlib import Path
import sys

project_root = Path(__file__).parent.parent
pyproject_path = project_root / "pyproject.toml"

# Parse pyproject.toml
content = pyproject_path.read_text()
in_deps = False
in_dev_deps = False
deps = []

for line in content.split('\n'):
    line = line.strip()
    
    if 'dependencies = [' in line:
        in_deps = True
        continue
    
    if in_deps:
        if line.startswith(']'):
            in_deps = False
        elif line and not line.startswith('#'):
            # Remove quotes and commas
            dep = line.strip('",').strip()
            if dep:
                deps.append(dep)

# Write requirements.txt
requirements_path = project_root / "requirements.txt"
requirements_path.write_text('\n'.join(deps) + '\n')

print(f"✓ Generated {requirements_path}")
print(f"  {len(deps)} dependencies")
