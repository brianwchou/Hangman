import React, { useContext, useState } from 'react';	
import { Context } from './context';
import {Grid, Paper, Typography, Button, TextField} from '@material-ui/core';

function GameScreen(setScreen, classes) {
  const [context, setContext] = useContext(Context)
//  const [word, setWord] = useState('')
//  const [char, setChar] = useState('')
//
  function handleWordGuessChange(e) {
    console.log(e)
    //setWord(e)
  }

  function handleCharGuessChange(e) {
    console.log(e)
    //setChar(e)
  }

  const submitWord = async() => {
    await context.hangman.makeWordGuess()
  }

  const submitChar = async() => {
    await context.hangman.makeCharGuess()
  }

  return (
    <div className={classes.root}>
      <Grid container justify='center' spacing={1} alignItems='center' style={{ minHeight: '100vh' }}>

        <Grid item xs={6}>
          <Paper className={classes.paper}>
          <img className={classes.img} 
            src='https://d1nhio0ox7pgb.cloudfront.net/_img/i_collection_png/512x512/plain/guillotine.png'
          />
            <Typography>
              Hangman Word Here
            </Typography>
         </Paper>
        </Grid>

        <Grid item xs={6} spacing={4}>
          <Paper className={classes.paper}>
            <Grid container justify='center' direction='column' spacing={1} alignItems='center' style={{ minHeight: '50vh' }}>
              <Typography>
                Guesses Left 50/50
              </Typography>

              <Typography>
                Used Characters: a b c d e f g h i j k l m n o p q r s t u v w x y z
              </Typography>

              <Grid container item justify='left' direction='row' spacing={1} alignItems='center'>
                <Grid item>
                  <TextField id="outlined-basic" label="Guess Word" variant="outlined" onChange={handleWordGuessChange}/>
                </Grid>
                <Grid item>
                  <Button variant='contained' color='primary' onClick={submitWord}>Submit Word</Button>
                </Grid>
              </Grid>

              <Grid container item justify='left' direction='row' spacing={1} alignItems='center'>
                <Grid item>
                  <TextField id="outlined-basic" label="Guess Character" variant="outlined" onChange={handleCharGuessChange}/>
                </Grid>
                <Grid item>
                  <Button variant='contained' color='primary' onClick={submitChar}>Submit Char</Button>
                </Grid>
              </Grid>

            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default GameScreen;
