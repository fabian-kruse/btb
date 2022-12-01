# Better than Bayes?

This javascript project is a game called "Better than Bayes?" in which the player plays against a bot that follows bayesian concept learning techniques. 
   
<div id="top"></div>


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#installation">Installation</a>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

In the game "Better than Bayes?" the player tries to be better at guessing or infering concepts than a bot.

In each round of a game a series of up to five different numbers are revealed to both the bot and the player. 
These numbers have been generated uniformly (without repetitions) from a concept.

In the beginning, this concept is unknown and is therefore called "hidden" concept. 
After each number is revealed the player and the bot can either take a guess which concept acutally generated the numbers or pass to signalize that they need more information before taking a guess. 

If a concept is guessed correctly or if the players are not able to infer it after having seen five numbers, the current round ends. Is a player was able to guess the concept, the player is rewared a point. 

The player with the most points after 10 rounds is the winner of the game.

The bot uses a technique called "Bayesian concept learning" which calculates a distribution over different concept hypothesis. By looking at the maximum of that distribution, the bot is able to make an educated guess about the hidden concept. Bayesian models are especially useful for this because they are able to update their  distribution belief according to the samples provided by the game following baye's rule :


$$p(h \mid \mathcal{D}) = \frac{p(\mathcal{D}\mid h)\times p(h)}{p(\mathcal{D})}$$


Here $h$ is a hypothesis concept and $\mathcal{D}$ is the set of observed samples.

Furthermore, if you are interested what the hidden concept is and what the bot thought it would be, notice that the hidden concept and the guesses of the bot are logged to the console.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Installation

Generally, you have two main options. 

If you want to try out the game immediatly, you can do so using [this link](https://fabian-kruse.github.io/btb/src/index.html).

Otherwise, if you want to add your own concepts or play around with the code you might want to clone this repository as follows:

1. Clone the repo
   ```sh
   git clone https://github.com/fabian-kruse/btb
   ```
2. If you now simply click on the /src/index.html file you can run the game in your own browser. To add more concept you can play around with the Round class in the script.js file.
 
Enjoy!

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Fabian Kruse - fabian_kruse@gmx.de

Project Link: [https://github.com/fabian-kruse/btb](https://github.com/fabian-kruse/btb)

<p align="right">(<a href="#top">back to top</a>)</p>


© 2022 GitHub, Inc.
Terms
Privacy
Security
Status
Docs
Contact GitHub
Pricing
API
Training
Blog
About
