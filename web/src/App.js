import React, { useContext } from 'react';
import { Context } from './context';
import Game from './Game.js';
import Start from './Start.js';

function App() {

  const [context, setContext] = useContext(Context);

  return (
    <div>
      {(context.contract === undefined) ? <Start/> : <Game/>}
    </div>
  );
}

export default App;
