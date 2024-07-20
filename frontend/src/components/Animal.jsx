import React from 'react'

function Animal(props) {
  return (
    <img
          className="md:size-96 size-60 mx-auto  hover:scale-110 ease-in-out duration-300 z-10"
          // eslint-disable-next-line react/prop-types
          src={props.address}
          alt="animal"
        />
  )
}


export default Animal

