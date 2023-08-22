import React from 'react';
import Game from './pages/game';
import { GameProvider } from './context/GameContext';
import './App.css';
import io from 'socket.io-client';

function App() {
	const socket = io('http://localhost:5000');
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

        // socket.on('opponentMove', ({ from, to }) => {
        //     chess.move({ from, to });
        //     setFen(chess.fen());
        // });
        socket.on('message', ({ message }) => {
            console.log({ message });
        });
	return (
		<GameProvider>
			<Game/>
		</GameProvider>
	);
}

export default App;
