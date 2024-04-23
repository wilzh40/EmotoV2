// import lookingAround from './motion/curiouslyLookingAround.json'

// List of JSON file names from the "motion" directory
const fileNames = [
    'opening.json',
    'yesSequence.json',
];

// Function to fetch all files and store them in an object
export async function fetchAllFiles() {
    const filesDictionary = {};

    // Helper function to fetch a single file
    const fetchFile = (fileName) => fetch(`../motion/${fileName}`)
        .then(response => response.json())
        .then(data => {
            // Strip filename.
            let baseName = fileName.replace(/\.[^/.]+$/, "");
            // Add the file content to the dictionary object
            filesDictionary[baseName] = data;
        });

    // Create an array of promises using the helper function
    const promises = fileNames.map(fileName => fetchFile(fileName));

    // Use Promise.all to wait for all promises to resolve
    await Promise.all(promises)
        .then(() => {
            console.log('All files loaded', filesDictionary);
            // Here you have a dictionary with all the data
            // You can use filesDictionary as needed
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        });
    return filesDictionary;
}

export function getOrientationByIndex(index) {
    console.log(allMotions["opening"][index])

    return {
        pitch: Math.sin(Date.now() * 0.001) * Math.PI * 0.1,
        yaw: Math.sin(Date.now() * 0.001) * Math.PI * 0.1,
        roll: Math.sin(Date.now() * 0.001) * Math.PI * 0.1,
    }
    return {
        pitch: data.pitch,
        yaw: data.yaw,
        roll: data.roll
    };
}
