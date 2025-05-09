"use client"

import dynamic from "next/dynamic"

const Viewer = dynamic(() => import("@/components/Viewer"), { ssr: false })

function ClientApp() {
  return (
    <>
      <Viewer/>
    </>
  )

   
}

export default ClientApp
