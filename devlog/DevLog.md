
# Context
Ever since I was a wee boy in college, I was fascinated by the idea of an emphatic robot. Can we create a robot that can understand human emotion?


# Log
## Apr 23 2024
* Added functionality to cycle through 4 eye states and 2 eye motions.
* With the EVI API release, was able to really bootstrap from their starter project into a usable frontend webapp.
* Thought process: maybe if we can train a visual action voice model to predict:
    * Eye state
    * Eye motion
    * pitch, yaw, roll
* We can then transform these into robot motions or prerecorded motions...what would be the MVP?
* Hello

Current video: 
![video](./assets/apr_24_video_small.mp4)

### RT-2 Vision Language-Action Model Transfer Web Knowledge to Robotic Control.
Key takeaways:
* They modified the least-frequently used tokens to represent discretized bins of action state, in this case of our 3DOF robot, pitch yaw and roll.
* Can we do the same here? How can we leverage an open-source visual action model in combination with the existing voice API to predict these tokens? 
* Thoughts: the inputs can be the tokenized emotion embedding (probably the output of the HUME API), the tokenized text from the last n chat messages, and the output can be just a very easy model.
* How would we train this? Well, we can track user head state (pitch yaw and roll) in a very subtle way. Of course we can exaggerate this in animations. Same with eye location.


## Apr 15 2024
* Got the emoto 3d prototype from Lucas Ochoa.
![emoto_prototype](./assets/emoto_prototype.png)
* Got the old emoto assets from Lucas Ochoa: a json containing a list of motor states + 4 eye animations.
* Spun up a very early version of pitch yaw and roll with a 3d js scene that displays 1 eye animation.
* Spent some time to parse the json messages to translate them to pitch yaw and roll.
m
