/**
 * 项目名称：井字棋
 * 
 * 初期功能：
 * 1.tic-tac-toe(三连棋)游戏的所有功能
 * 2.能够判定玩家何时获胜
 * 3.能够记录游戏进程
 * 4.允许玩家查看游戏的历史记录，也可以查看任意一个历史版本的游戏棋盘状态
 * 
 * 追加完成功能：
 * 1.在游戏历史记录列表显示每一步棋的坐标，格式为 (列号,行号)。
 * 2.在历史记录列表中加粗显示当前选择的项目。
 * 3.使用两个循环来渲染出棋盘的格子，而不是在代码里写死（hardcode）。
 * 4.添加一个可以升序或降序显示历史记录的按钮。
 * 5.每当有人获胜时，高亮显示连成一线的 3 颗棋子。
 * 6.当无人获胜时，显示一个平局的消息。
*/
import React from 'react';
import { render } from 'react-dom';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * 渲染了一个单独的 <button>，在每个方块中。
 * 受控组件，完全由Board组件进行控制。
 * 把Square组件重写为一个函数组件。
*/
const Square = function(props) {
	return (
		<button className='square' onClick={props.onClick} >
			<font color={props.color}>{props.value}</font>
		</button>
	);
}

//渲染了9个方块，完全控制Square组件
class Board extends React.Component {
	renderSquare(i) {
		//判断是否产生胜利者，若产生则将胜利路径上的字变为红色
		let color;
		if (this.props.winnerLine && this.props.winnerLine.includes(i)) {
			color = 'red';
		} else {
			color = 'black';
		}
		return (
			<Square key={i}
				value={this.props.squares[i]}
				onClick={ () => this.props.onClick(i) }
				color={color}
			/>
		);
	}
	
	render() {
		// 不使用迭代器的情况下，双重循环生成棋盘
		let row = [0, 1, 2];
		let col = [0, 1, 2];
		return (
			<div>
				{ row.map((x, index1) => 
					<div key={x} className='board-row'>
						{ col.map((y, index2) => this.renderSquare(index1*3 + index2))
						}
					</div>
				) }
			</div>
		);
	}
}
/**
 * 顶层组件，渲染了含有默认值的一个棋盘
 * 拥有对Board组件数据的完全控制权，可以根据history渲染历史步骤。
*/
class Game extends React.Component {
	//初次加载页面，只运行一次
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: [].fill(null),
			}],
			//用户选中的位置
			position: [null],
			//存储选项选中的状态
			choose: [].fill(false),
			//代表当前正在查看哪一项历史记录
			stepNumber: 0,
			//棋子每移动一步，xIsNext（布尔值）都会反转，该值将确定下一步轮到哪个玩家，并且游戏的状态会被保存下来。
			xIsNext: true,
			//判断是否逆序
			isReverse: false,
		};
	}
	
	//处理棋盘点击事件
	handleClick(i) {
		//使用.slice()函数对squares数组进行拷贝
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		const position = this.state.position.slice(0, this.state.stepNumber + 1);
		const pcurrent = calculatePosition(i);
		//判断胜负，已经赢了直接跳过。没有再改变点击的属性
		if (calculateWinner(squares)||squares[i]) {
			return;
		}
		//通过判断xIsNext的值来实现轮流落子
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState( {
			//concat()方法是将几个字符串连接到一起，但不会改变原数组
			history: history.concat([{
				squares,
			}]),
			position: position.concat(pcurrent),
			stepNumber: history.length,
			//反转xIsNext的值
			xIsNext: !this.state.xIsNext,
		});
	}
	
	//跳转至用户选择的步骤
	jumpTo(step) {
		const choose = Array(9).fill(false);
		const history = this.state.history;
		choose[step] = true;
		history.map((m,index) => {
			if (choose[index]) {
				document.getElementById(index).style.fontWeight = 'bold';
			} else {
				document.getElementById(index).style.fontWeight = 'normal';
			}
		});
		this.setState({
			choose,
			stepNumber: step,
			xIsNext: (step%2) == 0,
		});
	}
	
	//逆转排序
	reverse() {
		const isReverse = this.state.isReverse;
		this.setState({
			isReverse: !isReverse,
		});
	}
	
	render() {
		//使用最新一次历史记录来确定并展示游戏的状态
		const history = this.state.history;
		const position = this.state.position;
		const stepSum = history.length;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);
		
		//跳转步骤至某一步
		const moves = history.map((step,move) => {
			if (this.state.isReverse) {
				const desc = ((stepSum-move-1) ?
				 'Go to move #' + (stepSum-move-1) :
				 'Go to game start');
				return (
					//所以使用步骤的索引作为key
					<li key={stepSum-move-1}>
						<button id={stepSum-move-1} onClick={ () => this.jumpTo(stepSum-move-1) } >{desc}{position[stepSum-move-1]}</button>
					</li>
				);
			} else {
				const desc = (move ?
				 'Go to move #' + move :
				 'Go to game start');
				return (
					//所以使用步骤的索引作为key
					<li key={move}>
						<button id={move} onClick={ () => this.jumpTo(move) }>{desc}{position[move]}</button>
					</li>
				);
			}
		});
		
		//判断当前游戏状态，返回胜利信息
		let status;
		let winnerLine = [];
		if (winner) {
			status = 'Winner：' + winner.user;
			winnerLine = winner.line;
		} else if ((this.state.stepNumber==9)||winner) {
			status = 'No one wins';
		} else {
			status = 'Next player：' + (this.state.xIsNext ? 'X' : 'O');
		}
		
		return (
			<div className='game'>
				<div className='game-board'>
					<Board 
						squares={current.squares}
						onClick={ (i) => this.handleClick(i) }
						winnerLine={winnerLine}
					/>
				</div>
				<div className='game-info'>
					<div>
						{status}
						&nbsp;&nbsp;&nbsp;&nbsp;
						<button onClick={ () => this.reverse() }>↑↓</button>
					</div>
					<ol className='game-move' reversed={ this.state.isReverse }>
						{moves}
					</ol>
				</div>
			</div>
		);
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);

//判断是否有人胜利，返回胜利者和胜利路线
const calculateWinner = function(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	let winner;
	lines.map((win,i) => {
		let [a, b, c] = lines[i];
		if (squares[a]
			&& (squares[a] === squares[b])
			&& (squares[a] === squares[c])
		) {
			winner = { user: squares[a], line: [a, b, c] };
		}
	});
	return winner;
}

//判断落子位置并返回坐标值
const calculatePosition = function(i) {
	const x = i%3+1;
	const y = parseInt(i/3+1, 10);
	const position = `(${x},${y})`;
	return position;
}