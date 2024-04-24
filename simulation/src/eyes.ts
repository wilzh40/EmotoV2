
// List of JSON file names from the "motion" directory
const eyeFileNames = [
    'happy_center.mp4',
    'happy_up.mp4',
    'normal_short.mp4',
    'normal.mp4',
];

// Function to fetch all files and store them in an object
export async function fetchAllEyes() {
    const filesDictionary = {};

    // Helper function to fetch a single file
    const storeBasename = (fileName) => {
            // Strip filename.
            let baseName = fileName.replace(/\.[^/.]+$/, "");
            // Add the file content to the dictionary object
            filesDictionary[baseName] = "../eyes/" + fileName;
        };

    // Create an array of promises using the helper function.
    eyeFileNames.map(fileName => storeBasename(fileName));
    return filesDictionary;
}

