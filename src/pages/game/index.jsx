import React, {useState, useRef, useEffect, useContext} from 'react';
import {Chess} from 'chess.js';
import createBoard from '../../functions/create-board';
import Board from '../../components/board';
import { GameContext } from '../../context/GameContext';
import { types } from '../../context/actions';
import { getGameOverState } from '../../functions/game-over';
import GameOver from '../../components/gameover';
import io from 'socket.io-client';


const socket = io('http://localhost:5000', {autoConnect:false});
const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const Game = () => {
    const [fen, setFen] = useState(FEN);
    const {current: chess} = useRef(new Chess(fen));
    const [board, setBoard] = useState(createBoard(fen));
    const { dispatch, gameOver } = useContext(GameContext);

    
	useEffect(() => {
		setBoard(createBoard(fen));
	}, [fen]);


    useEffect(() => {
        socket.emit('sample', "hello");
        socket.emit('join', { name: 'Frank', gameID: '20' }, ({ error, color }) => {
            console.log({ color });
        });
        socket.on('welcome', ({ message, opponent }) => {
            console.log({ message, opponent });
        });
        socket.on('opponentJoin', ({ message, opponent }) => {
            console.log({ message, opponent });
        });

        socket.on('opponentMove', ({ from, to }) => {
            chess.move({ from, to });
            setFen(chess.fen());
        });
        socket.on('message', ({ message }) => {
            console.log({ message });
        });
    }, [chess]);

    useEffect(()=>{
        const [gameOver, status] = getGameOverState(chess);
        if(gameOver){
            dispatch({ type: types.GAME_OVER, status, player: chess.turn()});
            return;
        }
        dispatch({
            type: types.SET_TURN, 
            player: chess.turn(), 
            check: chess.inCheck(), 
        })
    }, [fen, dispatch, chess]);




    const fromPos = useRef();

    const makeMove = (pos) => {
        const from = fromPos.current;
        const to = pos;
        chess.move({from , to});
        dispatch({type: 'CLEAR_POSSIBLE_MOVES'});
        setFen(chess.fen());
        socket.emit('move', { gameID: '20', from, to: pos });

    };

    const setFromPos = (pos) => {
        fromPos.current = pos
        dispatch({
            type: 'SET_POSSIBLE_MOVES', 
            moves: chess.moves({ square: pos}), 
        });
    };
    if(gameOver) {
        return <GameOver />;
    }
    return (
        <div className='game'>
            <Board 
            cells = {board} 
            makeMove={makeMove} 
            setFromPos = {setFromPos} />
        </div>
    );
}

export default Game;