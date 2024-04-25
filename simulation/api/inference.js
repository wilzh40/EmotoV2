import OpenAI from "openai";

import {  fetchAllMotions } from '../shared/motion.js';
import { fetchAllEyes } from '../shared/eyes.js';

const openai = new OpenAI(
    {
        apiKey: process.env.VITE_OAI_API_KEY,
        // TODO: Abstract this into a backend call eventually...
        dangerouslyAllowBrowser: true
    }
);

export default async function (req, res) {
    const { chatHistory, possibleMotionStates, possibleEyeStates } = req.body;
    
    const prompt = `
        Given the following possible motion states and eyes states:
        motion: ${possibleMotionStates}
        eyes: ${possibleEyeStates}

        Return the most probable eye and motion state.

        Return in json after RESPONSE: with no extra text. 

        Example:
        "Hi, how are you doing today?"
        Response:
        {
            "motionState": "opening",
            "eyeState": "happy_up"
        }

        Text: ${chatHistory}
        ${req.body.text}
        RESPONSE:
    `;
    
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant with high EQ." },
            { role: "user", content: prompt },
        ],
        model: "gpt-3.5-turbo",
    });
 
    console.log(completion.choices[0]);
    res.status(200).send(completion.choices[0]);
}
