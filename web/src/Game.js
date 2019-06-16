import React, { useState, useEffect, useContext } from 'react';
import { EthersContext } from './EthersContext.js';

function Game() {

  const [ethersContext, setEthersContext] = useContext(EthersContext);
  const [hangmanString, setHangmanString] = useState("");
  const [charGuess, setCharGuess] = useState("");
  const [wordGuess, setWordGuess] = useState("");
  const [currentMisses, setCurrentMisses] = useState(0);
  const [maxMisses, setMaxMisses] = useState(0);
  const [usedChars, setUsedChars] = useState([]);
  const [winState, setWinState] = useState(0); //-1 is lose, +1 is win
  const [tx, setTx] = useState(null);

  ethersContext.contract.on('TurnTaken', () => {
    console.log("Turn Taken");
  });

  ethersContext.contract.on('GameWin', () => {
    console.log("Game Win");
    setWinState(1)
  });

  ethersContext.contract.on('GameLose', () => {
    console.log("Game Lose");
    setWinState(-1)
  });


  // Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    clearInputs();
    updateGuessCounter();
    updateVisibleChars();
    updateUsedChars();
  }, [tx]);

  function clearInputs() {
    setCharGuess("");
    setWordGuess("");
  }

  async function handlePostActions() {
    clearInputs();
    updateGuessCounter();
    updateVisibleChars();
    updateUsedChars();
  }

  async function updateGuessCounter() {
    let numerator = await ethersContext.contract.currentMisses();
    setCurrentMisses(numerator.toNumber());
    let denominator = await ethersContext.contract.maxAllowedMisses();
    setMaxMisses(denominator.toNumber());
  }

  async function updateVisibleChars() {
    let hexChars = await ethersContext.contract.getCorrectlyGuessedCharacters();
    console.log(hexChars);

    //convert hex representation to char representation
    let result = []
    hexChars.forEach((hex) => {
      if(hex !== "0x00") {
        result.push(window.web3.toAscii(hex));
      } else {
        result.push("_");
      }
    })
    console.log(result);
    result = result.join(" ");
    setHangmanString(result);
  }

  async function updateUsedChars() {
    let hexChars = await ethersContext.contract.getUsedCharacters();
    console.log(hexChars);

    //convert hex representation to char representation
    let result = []
    hexChars.forEach((hex) => {
      if(hex !== "0x00") {
        result.push(window.web3.toAscii(hex));
      } else {
        result.push("_");
      }
    })
    console.log(result);
    result = result.join(" ");
    setUsedChars(result);
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
    setTx(tx);
    //handlePostActions();
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
    setTx(tx);
    //handlePostActions();
  }

  function GuessCounter(props) {
    if (props.numerator === 0 && props.denominator === 0) {
      //if num and denom are 0 then we haven't loaded, don't show anything
      return null;
    } else {
      return (
        <div>
        { props.numerator } of { props.denominator } misses left
        </div>
      );
    } 
  }

  function WinState() {
      if(winState > 0) {
        return (<div>Game Won!</div>);
      } else if(winState < 0) {
        return (<div>Game Lost</div>);
      } else {
        return null;
      }
  }

  function UsedChars(props) {
    return (
      <div>
      Used Characters:
      <br />
      [{ props.chars }]
      </div>
    );
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
        numerator = { currentMisses }
        denominator = { maxMisses }
      />

      <br />
      <UsedChars chars = { usedChars }/>
      <br />
      <WinState/>
    </div>
  );
}

export default Game;
