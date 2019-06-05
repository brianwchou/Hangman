import React, { useState, useEffect, useContext } from 'react';
import { EthersContext } from './EthersContext.js';

function Game() {

  const [ethersContext, setEthersContext] = useContext(EthersContext);
  const [hangmanString, setHangmanString] = useState("");
  const [charGuess, setCharGuess] = useState("");
  const [wordGuess, setWordGuess] = useState("");
  const [currentGuesses, setCurrentGuesses] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(0);

  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    updateGuessCounter();
  }, []);

  function clearInputs() {
    setCharGuess("");
    setWordGuess("");
  }

  async function updateGuessCounter() {
    let numerator = await ethersContext.contract.currentGuesses();
    setCurrentGuesses(numerator.toNumber());
    let denominator = await ethersContext.contract.maxGuesses();
    setMaxGuesses(denominator.toNumber());
  }

  async function guessChar() {
    if(ethersContext.contract === undefined) {
      console.log("no contract deployed");
      return;
    } else if (charGuess === "") {
      console.log("no character in box");
      return;
    } else if (charGuess.length > 1) {
      console.log("1 character only");
      return;
    }

    console.log(ethersContext.contract);
    let guess = window.web3.fromAscii(charGuess);
    console.log(guess);
    let tx = await ethersContext.contract.makeCharGuess(guess);
    console.log(tx);
    await tx.wait();

    clearInputs();
    updateGuessCounter();
  }

  async function guessWord() {
    if(ethersContext.contract === undefined) {
      console.log("no contract deployed");
      return;
    }  else if (wordGuess === "") {
      console.log("no word in box");
      return;
    }
    console.log(ethersContext.contract);
    let guess = window.web3.fromAscii(wordGuess);
    console.log(guess);
    let tx = await ethersContext.contract.makeWordGuess(guess);
    console.log(tx);
    await tx.wait();

    clearInputs();
    updateGuessCounter();
  }

  function GuessCounter(props) {
    if (props.numerator === 0 && props.denominator === 0) {
      return null;
    } else if (props.numerator !== 0 && props.numerator === props.denominator) {
      return (<div>Game Over</div>);
    } else {
      return (
        <div>
        { props.numerator } of { props.denominator } guesses left
        </div>
      );
    }
  }

  return (
    <div>
     { hangmanString }
      <br />
      <input
          type = "text"
          name = "character"
          placeholder = "character"
          value = { charGuess }
          maxLength = "1"
          onChange = { e => setCharGuess(e.target.value) }
      />&nbsp;
      <button type="button" onClick={ guessChar }>Guess Character</button>
      <br />

      <input
          type = "text"
          name = "word"
          placeholder = "word"
          value = { wordGuess }
          onChange = { e => setWordGuess(e.target.value) }
      />&nbsp;
      <button type="button" onClick={ guessWord }>Guess Word</button>
      <br />
      <br />

      <GuessCounter 
        numerator = { currentGuesses }
        denominator = { maxGuesses }
      />
    </div>
  );
}

export default Game;
