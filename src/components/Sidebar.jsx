import React from 'react';
import './Sidebar.css';
const courses = [
  'MERN Development Course',
  'Web Development Basic Course',
  'Graphics Designing',
  'Grade XII: Mathematics',
  'Grade XII: Account',
  'Grade XII: Computer Science',
  'Grade XII: Business Math',
];
function Sidebar() {
    return (
     <aside className="sidebar">
        <h3>Browse Courses</h3>
        <ul>
            {courses.map((course, index) => (
                <li key ={index}>
                    <a href="#">{course}</a>
                </li>
            ))
        }  
        </ul>
        </aside>
    );
}
export default Sidebar;