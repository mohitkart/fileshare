
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useLayoutEffect, useState } from "react";
import Main from "./MainContent";


export default function Page() {
const [hydrarte,setHydrate]=useState(false)

useLayoutEffect(()=>{
// eslint-disable-next-line react-hooks/set-state-in-effect
setHydrate(true)
},[])

if(!hydrarte) return <></>
  return <Main/>
}
