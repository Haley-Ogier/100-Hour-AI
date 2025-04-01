import React, { useState, useEffect, useRef } from 'react';
import './TaskCreate.css';
import NavBar from './NavBar';

function TaskCreate() {
    const questions = [
        "Name of task: ",
        "Type of task: ",
        "Deadline: ",
        "Sub-tasks: "
    ];
    
    return (
        <>
            <NavBar />
            <div className='task-create-page'>
                <h1 className='task-create-title'>Create Tasks Here:</h1>
                <div className='questions-container'>
                    <form className='task-create-form'>
                        <div className='form-grid'>
                            {questions.map((question, index) => (
                                <>
                                    <div key={`q-${index}`} className='question-column'>
                                        <label htmlFor={`question${index}`}>{question}</label>
                                    </div>
                                    <div key={`i-${index}`} className='input-column'>
                                        <input 
                                            type="text" 
                                            id={`question${index}`} 
                                            className="input-field" 
                                            required 
                                        />
                                    </div>
                                </>
                            ))}
                        </div>
                    </form>
                    <button type="submit" className='submit-button'>Create task</button>
                </div>
            </div>
        </>
    );
    
    /*
    return(
        <>
            <NavBar />
            <div className='task-create-page'>
                <h1 className='task-create-title'>Create Tasks Here:</h1>
                <div className='form-container'>
                    <form className='task-create-form'>
                        <input type="text" placeholder='Enter task here:' className="username-and-password" required />
                    </form>
                </div>
                <button type="submit">Create task</button>
            </div>
        </>
    );
    */
}

export default TaskCreate;