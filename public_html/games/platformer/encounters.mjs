import { GameFlow } from '../../runtime/game-flow.mjs';
// Adapter around the existing platform game. Pipes/doors can call enter later.
export function createPlatformEncounters({getGame,participants,isOnline,release,restore,launch}){
  const flow=new GameFlow({
    suspend(){
      if(isOnline())throw new Error('Tussenspellen in online kamers zijn nog niet beschikbaar.');
      const game=getGame();
      if(!game||!['playing','paused'].includes(game.state))throw new Error('Start eerst een platformlevel.');
      const parent={game,state:game.state};game.state='paused';
      try{release();}catch(error){game.state=parent.state;throw error;}
      return parent;
    },
    resume(parent){if(getGame()===parent.game)parent.game.state=parent.state;restore();},
    launch
  });
  return {
    get busy(){return flow.busy;},
    enter(game,origin,options={}){return flow.enter({game,origin,options,participants:participants()});}
  };
}
