"use client"

import dynamic from "next/dynamic"

const Viewer = dynamic(() => import("@/components/viewer/index"), { ssr: false })

function ClientApp() {
  return (
    <>
      <Viewer/>
    </>
  )

   
}

export default ClientApp
