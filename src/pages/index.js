import Head from "next/head";
import Board from "@/components/Board";
import Menu from "@/components/Menu";
import Toolbox from "@/components/Toolbox";


export default function Home() {
  return (
    <>
   <Head>
    <title>Drawie</title>
    <meta name="A simple app that allows you to create and customize digital drawings with ease." />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/logo.jpg" />
   </Head>
    <Menu/>
   <Toolbox/>
   <Board/>
    </>
   
  )
}
