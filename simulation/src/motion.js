// List of JSON file names from the "motion" directory
const motionFileNames = [
    'opening.json',
    'yes_sequence.json',
];

// Fetches all robot motions and returns a dictionary.
export async function fetchAllMotions() {
    const filesDictionary = {};

    // Helper function to fetch a single file
    const fetchFile = (fileName) => fetch(`../motions/${fileName}`)
        .then(response => response.json())
        .then(data => {
            // Strip filename.
            let baseName = fileName.replace(/\.[^/.]+$/, "");
            // Add the file content to the dictionary object
            filesDictionary[baseName] = data;
        });

    // Create an array of promises using the helper function
    const promises = motionFileNames.map(fileName => fetchFile(fileName));

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

