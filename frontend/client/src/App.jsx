import { useState } from 'react'
import { useEffect } from "react";
import './App.css'
import socket from "./socket"

function App(){
  useEffect(
    socket.on("connection",()=>{
    console.log("connected to the server successfully",socket.id)
  })
)}
export default (App)