# Flathub Submission Guide

This document describes how to submit msigd-gui to Flathub.

## Prerequisites

- Flatpak and flatpak-builder installed
- GitHub account with fork of `flathub/flathub`
- The app builds and runs correctly

## Files Required

All submission files are in the `flatpak/` directory:

| File | Description |
|------|-------------|
| `io.github.aydiler.msigd-gui.yml` | Main Flatpak manifest |
| `npm-sources.json` | Offline npm dependencies (generated) |
| `cargo-sources.json` | Offline Cargo dependencies (generated) |

Additionally, these files in the repo root are installed by the manifest:

| File | Description |
|------|-------------|
| `io.github.aydiler.msigd-gui.metainfo.xml` | AppStream metadata |
| `io.github.aydiler.msigd-gui.desktop` | Desktop entry file |
| `LICENSE` | MIT license |

## Building Locally

### 1. Install Flatpak Builder

```bash
flatpak install -y flathub org.flatpak.Builder
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

### 2. Build and Install

```bash
cd flatpak
flatpak run --command=flathub-build org.flatpak.Builder --install io.github.aydiler.msigd-gui.yml
```

Or using flatpak-builder directly:

```bash
flatpak-builder --user --install --force-clean build io.github.aydiler.msigd-gui.yml
```

### 3. Run

```bash
flatpak run io.github.aydiler.msigd-gui
```

## Validating Files

### Lint the Manifest

```bash
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest io.github.aydiler.msigd-gui.yml
```

### Lint the Metainfo

```bash
flatpak run --command=flatpak-builder-lint org.flatpak.Builder appstream ../io.github.aydiler.msigd-gui.metainfo.xml
```

Both commands should exit with code 0 and no errors.

## Regenerating Dependency Manifests

If dependencies change (package.json or Cargo.lock updated), regenerate the offline sources:

### npm Sources

```bash
# Install the generator
pipx install "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node"

# Generate (must NOT have node_modules present)
mv node_modules node_modules.bak
flatpak-node-generator npm package-lock.json -o flatpak/npm-sources.json
mv node_modules.bak node_modules
```

### Cargo Sources

```bash
# Clone the generator
git clone --depth 1 https://github.com/flatpak/flatpak-builder-tools.git /tmp/flatpak-builder-tools

# Create venv and install dependencies
python3 -m venv /tmp/cargo-gen-venv
/tmp/cargo-gen-venv/bin/pip install tomlkit aiohttp

# Generate
/tmp/cargo-gen-venv/bin/python /tmp/flatpak-builder-tools/cargo/flatpak-cargo-generator.py \
    src-tauri/Cargo.lock -o flatpak/cargo-sources.json
```

## Submitting to Flathub

### 1. Fork the Flathub Repository

Fork `flathub/flathub` on GitHub.

### 2. Create Submission Branch

```bash
git clone --branch new-pr https://github.com/YOUR_USERNAME/flathub.git flathub-submission
cd flathub-submission
git checkout -b add-msigd-gui
```

### 3. Copy Files

```bash
cp /path/to/msigd-gui/flatpak/io.github.aydiler.msigd-gui.yml .
cp /path/to/msigd-gui/flatpak/npm-sources.json .
cp /path/to/msigd-gui/flatpak/cargo-sources.json .
```

### 4. Commit and Push

```bash
git add -A
git commit -m "Add io.github.aydiler.msigd-gui"
git push -u origin add-msigd-gui
```

### 5. Create Pull Request

**Important:** Use the GitHub web interface to create the PR so the template is auto-filled.

1. Go to https://github.com/flathub/flathub
2. Click "Compare & pull request" for your branch
3. Ensure base branch is `new-pr` (NOT `master`)
4. Fill out the template completely:

```markdown
<!-- ⚠️⚠️  Submission pull request MUST be made against the `new-pr` **base branch** ⚠️⚠️  -->

<!-- 💡 Please go to the preview tab to view the markdown below 💡 -->

### Please confirm your submission meets all the criteria

<!-- 💡 Please replace each `[ ]` with `[X]` when the step is complete 💡 -->

<!-- 💡 Please tick and write 'N/A' with a reason if a checklist item below is not applicable 💡 -->

- [x] Please describe the application briefly. MSI Monitor Control is a desktop GUI for controlling MSI gaming monitors on Linux, featuring display settings, color management, and LED control.
- [x] Please attach a video showcasing the application on Linux using the Flatpak. <UPLOAD YOUR VIDEO HERE>
- [x] The Flatpak ID follows all the rules listed in the [Application ID requirements][appid].
- [x] I have read and followed all the [Submission requirements][reqs] and the [Submission guide][reqs2] and I agree to them.
- [x] I am an author/developer to the project.

<!-- ⚠️⚠️  Please DO NOT modify anything below this line ⚠️⚠️  -->

[appid]: https://docs.flathub.org/docs/for-app-authors/requirements#application-id
[reqs]: https://docs.flathub.org/docs/for-app-authors/requirements
[reqs2]: https://docs.flathub.org/docs/for-app-authors/submission
```

### 6. Required: Video Demo

You **must** attach a video (screencast) showing the app running as a Flatpak on Linux. Record with:

```bash
# Using OBS, SimpleScreenRecorder, or built-in screen recorder
# Show: app launching, switching tabs, changing settings
```

Upload the video directly to the GitHub PR comment/description.

## After Submission

1. Wait for reviewer feedback (may take days/weeks)
2. Reviewers may comment `bot, build` to trigger a test build
3. Address any requested changes
4. Once approved, the app will be published to Flathub

## Updating the App

After initial acceptance, updates go to a dedicated repo `flathub/io.github.aydiler.msigd-gui`. You'll receive write access after approval.

For updates:
1. Update the manifest in the dedicated repo
2. Change the `tag` and `commit` to the new release
3. Regenerate dependency manifests if needed
4. Push to trigger automatic build

## Troubleshooting

### "appid-url-not-reachable" Error

The linter checks if the GitHub repo exists. Ensure:
- App ID matches repo: `io.github.aydiler.msigd-gui` → `github.com/aydiler/msigd-gui`
- Repo is public

### "runtime-is-eol" Warning

Update `runtime-version` in the manifest to a supported version (currently `48` for GNOME).

### Build Fails Offline

Regenerate the npm-sources.json and cargo-sources.json files. Ensure all dependencies are captured.

## References

- [Flathub Submission Guide](https://docs.flathub.org/docs/for-app-authors/submission)
- [Flathub Requirements](https://docs.flathub.org/docs/for-app-authors/requirements)
- [MetaInfo Guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines)
- [Flathub Linter Docs](https://docs.flathub.org/docs/for-app-authors/linter)
- [flatpak-builder-tools](https://github.com/flatpak/flatpak-builder-tools)
