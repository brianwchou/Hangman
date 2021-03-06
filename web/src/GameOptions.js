import React, { useContext, useState } from 'react';	
import { Context } from './context';
import { ethers } from 'ethers';
import HangmanFactoryJSON from './contracts/HangmanFactory.json';
import LinkTokenJSON from './contracts/LinkToken.json';
import Hangman from './Hangman';
import { Grid, Typography, Button, TextField, LinearProgress } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import { CHAINLINK_JOB_ID, HANGMAN_FACTORY_ADDRESS, LINK_TOKEN_ADDRESS, EMPTY_ADDRESS } from './constants'

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2)
    }
  }
}));

function GameOptions({setScreen}) {
  const classes = useStyles();
  const [context, setContext] = useContext(Context)
  const [statusBar, setStatusBar] = useState(false)
  const [continueAddress, setContinueAddress] = useState('')
  const [continueDisabled, setContinueDisabled] = useState(true);

  const connectWallet = async() => {
    console.log(`[User Action]: connect wallet pressed`)

    if (context.isDebug) {
        setContext(state => ({ ...state, isLoggedIn: true}));
    } else {
      if (!context.isLoggedIn) {
        await context.walletProvider.provider.enable()
        setContext(state => ({ ...state, isLoggedIn: true}));

        // init linktoken 
        const linkToken = new ethers.Contract(
          LINK_TOKEN_ADDRESS,
          LinkTokenJSON.abi,
          context.walletProvider.getSigner()
        );

        // init factory
        const hangmanFactory = new ethers.Contract(
          HANGMAN_FACTORY_ADDRESS,
          HangmanFactoryJSON.abi,
          context.walletProvider.getSigner()
        );

        // init hangman
        let hangman = new Hangman(hangmanFactory, linkToken)
        setContext(state => ({
          ...state,
          hangman
        }))
      }
    }
  }

  const createNewGame = async () => {
    await context.hangman.newGame(
      CHAINLINK_JOB_ID, 
      context.walletProvider.provider.selectedAddress,
      context.walletProvider.getSigner(),
      () => {
        setStatusBar(false)
        setScreen('GAME')
      }
    )
  }

  const newGame = async() => {
    console.log(`[User Action]: New Game button pressed`)

    if (context.isDebug) {
      setScreen('GAME')
    } else {
      setStatusBar(true)

      // first check if factory is authorized to move link
      let isAuthorized = await context.hangman.isFactoryAuthorized(context.walletProvider.provider.selectedAddress);
      if (!isAuthorized) {
        await context.hangman.setLinkAllowance( async () => {
          await createNewGame()
        })
      } else {
        await createNewGame()
      }
    }
  }

  const addressOnChange = async (e) => {
    console.log(`[User Action]: input continue game address field: ${e.target.value}`)
    // needs to start with 0x and be of length 42
    if ((e.target.value.substring(0, 2) === '0x') && (e.target.value.length === 42)){
      setContinueDisabled(false)
      setContinueAddress(e.target.value)
    } else {
      setContinueDisabled(true)
      setContinueAddress('')
    }
  }

  const continueGame = async () => {
    console.log(`[User Action]: Continue Game button pressed`)
    if (context.isDebug) {
      setScreen('GAME')
    } else {
      context.hangman.setGame(
        continueAddress, 
        context.walletProvider.getSigner()
      )
      setScreen('GAME')
    }
  }

  return (
    (!context.isLoggedIn) ?
    <div>
      <Grid container justify='center' direction='column' spacing={1} alignItems='center'>
        <Grid item>
          <Button variant='contained' color='primary' onClick={connectWallet}>Connect Wallet</Button>
        </Grid>
      </Grid>
    </div>
    :
    <div>
      <Grid container justify='center' direction='column' spacing={1} alignItems='center'>
        <Grid item>
          <Typography align='center'>
            player address: {context.walletProvider.provider.selectedAddress}
          </Typography>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' onClick={newGame}>New Game</Button>
        </Grid>
        { statusBar && 
          <Grid item className={classes.root}>
            <LinearProgress color="primary" variant="indeterminate"/>
          </Grid>
        }
        <Grid item>
          <Button variant='contained' color='primary' disabled={continueDisabled} onClick={continueGame}>Continue Game</Button>
        </Grid>
        <Grid item>
          <TextField id="outlined-basic" label="Contract Address" variant="outlined" placeholder={ EMPTY_ADDRESS } onChange={addressOnChange} />
        </Grid>
      </Grid>
    </div>
  )
}

export default GameOptions;
