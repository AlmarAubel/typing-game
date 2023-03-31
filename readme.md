# Pokémon Typing Game

This Pokémon Typing Game is a fun and educational game that helps children learn to type faster while catching Pokémon. The game is built using Vue 3, Composition API, Script Setup, and Pinia to manage the state of the application.

The game consists of words flying across the screen, and the player must type the words correctly to catch Pokémon. As the player progresses, they can earn various types of Pokéballs, each with different catch rates, and collect Pokémon in their inventory.

[![Netlify Status](https://api.netlify.com/api/v1/badges/3ca38001-5192-4d21-afc2-d97d32503ffa/deploy-status)](https://app.netlify.com/sites/vocal-bienenstitch-4a9c44/deploys)

# GPT-4 Generated

This project was designed and developed with the help of GPT-4, OpenAI's advanced language model. GPT-4 provided guidance on structuring the game, creating the Vue components and Pinia stores, fetching data from the PokeAPI, and implementing the Pokémon catching mechanics. Throughout the conversation, GPT-4 offered suggestions on code improvements, bug fixes, and ideas for expanding the game's features to make it more engaging for children.

## Recap of the Conversation

During the conversation, the following topics were discussed and implemented:

Steps Taken

1. Basic game setup: Created a simple game that displays words from a list and animates them from left to right. Players type letters in the correct order to score points.
1. Difficulty selection: Added difficulty levels (easy, medium, hard) that the player can choose before starting the game.
1. Score and lives: Added a scoring system and three lives. Players lose a life when a word reaches the end of the screen.
1. Random word heights: Updated the word animation to display words at random heights.
1. Restart button: Added a button to restart the game next to the score with a refresh icon.
1. Letters typed per minute counter: Added a counter at the top left to display the letters typed per minute.
1. Game Over: Modified the game to pause when the player loses all lives.
1. Adjusting difficulty based on screen width: Updated the word animation speed based on the screen width to maintain consistent difficulty.
1. Fixing animation issue: Fixed an issue with losing lives prematurely after restarting the game by correctly clearing animation intervals.
1. Displaying Game Over message in a div: Replaced the game over alert with a styled div that shows the final score.
1. Loading word lists from JSON: Enabled loading word lists from a JSON file, allowing players to choose from different word lists.
1. Dynamically populating word list selection: Populated the word list selection dropdown based on the keys in the JSON file.

After that we started a new chat where you asked:

- General code review and improvements, such as better function naming, const/let usage, and updating the game loop.
- Fixing a bug where old words were still animated even after a new word appeared.
Ideas to improve the game, such as a reward system, leaderboards, achievements, and smoother animations.
- Implementing a system where the player can earn Pokémon based on their performance, including a discussion on different types of Pokéballs and Pokémon rarity.
- Converting the code to use Vue 3, Composition API, Script Setup, and Pinia for state management.
- The resulting Pokémon Typing Game is an engaging and educational experience for children, helping them improve their typing skills while having fun catching Pokémon.

# License

This project is licensed under the MIT License - see the LICENSE.md file for details.
