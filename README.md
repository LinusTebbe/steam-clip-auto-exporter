# steam-clip-auto-exporter

Steam sadly doesn't have a way to automatically export all clips you create.\
I already back up all my Steam Screenshots centrally and wanted to automate the
export process.\
So this does exactly that (using ffmpeg).

## Usage

0. Make sure you have [ffmpeg installed](https://www.ffmpeg.org/download.html).
1. Download most recent release and run the executable.
2. Fill in the newly created config.json file with your correct paths (right now
   no custom path for the clips is supported).
3. Run the executable again.
4. Profit

Now all your clips will be exported as .mp4 files to the specified folder.
