import { SignUp } from '@clerk/nextjs'
import React from 'react'

const SignUpPage = () => {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <SignUp />
    </div>
  )
}

export default SignUpPage
