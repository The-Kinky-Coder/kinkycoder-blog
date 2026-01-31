const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { Converter } = require('ffmpeg-stream');
const ffmpegPath = require('ffmpeg-static');

// Settings
const SAMPLES_PER_SECOND = 100; // Resolution of the waveform
const AUDIO_SAMPLE_RATE = 8000; // Process at 8kHz (sufficient for visual peaks)
const SAMPLES_PER_PEAK = AUDIO_SAMPLE_RATE / SAMPLES_PER_SECOND;

async function generatePeaks(filePath) {
    const ext = path.extname(filePath);
    const jsonPath = filePath.replace(ext, '.json');

    // Check if JSON exists and is newer
    if (fs.existsSync(jsonPath)) {
        const audioStats = fs.statSync(filePath);
        const jsonStats = fs.statSync(jsonPath);
        if (jsonStats.mtime > audioStats.mtime) {
            console.log(`Skipping ${path.basename(filePath)} (peaks already exist)`);
            return;
        }
    }

    console.log(`Processing ${path.basename(filePath)}...`);

    return new Promise((resolve, reject) => {
        const converter = new Converter(ffmpegPath);
        converter.createInputFromFile(filePath);
        const stream = converter.createOutputStream({
            f: 's16le',
            ac: 1,
            ar: AUDIO_SAMPLE_RATE
        });

        const peaks = [];
        let currentMax = 0;
        let sampleCount = 0;

        // Read stream
        stream.on('data', (chunk) => {
            // Chunk is a Buffer of Int16 values (2 bytes each)
            for (let i = 0; i < chunk.length; i += 2) {
                // Read Int16 (little endian)
                const raw = chunk.readInt16LE(i);
                const abs = Math.abs(raw);
                
                if (abs > currentMax) {
                    currentMax = abs;
                }

                sampleCount++;

                if (sampleCount >= SAMPLES_PER_PEAK) {
                    // Normalize to 0-1 range (INT16 max is 32768)
                    const normalized = Number((currentMax / 32768).toFixed(4));
                    peaks.push(normalized);
                    
                    // Reset
                    currentMax = 0;
                    sampleCount = 0;
                }
            }
        });

        stream.on('end', () => {
            // Save to JSON
            const data = {
                version: 1,
                channels: 1,
                sample_rate: AUDIO_SAMPLE_RATE,
                samples_per_pixel: SAMPLES_PER_PEAK,
                data: peaks
            };
            
            fs.writeFileSync(jsonPath, JSON.stringify(data));
            console.log(`Saved peaks to ${path.basename(jsonPath)} (${peaks.length} points)`);
            resolve();
        });

        stream.on('error', (err) => {
            console.error(`Error processing ${filePath}:`, err);
            reject(err);
        });

        converter.run().catch(reject);
    });
}

// Find all audio files in src
async function run() {
    try {
        // Broad search for common web audio formats
        const files = await glob('src/**/*.{mp3,wav,ogg,m4a,flac,aac,webm,opus}');
        console.log(`Found ${files.length} audio files.`);
        
        for (const file of files) {
            await generatePeaks(path.resolve(file));
        }
    } catch (err) {
        console.error('Glob error:', err);
    }
}

if (require.main === module) {
    run();
}

module.exports = run;
