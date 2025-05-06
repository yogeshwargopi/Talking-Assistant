import React from 'react'
import AvatarViewer from './components/AvatarViewer'

const App = () => {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/assets/images/bg1.jpg')] relative">
      {/* Optional overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      {/* Content - Added h-screen to ensure full height */}
      <div className="relative z-10 h-screen">
        <AvatarViewer />
      </div>
    </div>
  )
}

export default App
