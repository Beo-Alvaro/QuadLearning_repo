import { StrandDataContext } from '../context/strandDataContext'
import { useContext } from 'react'

export const useStrandsDataContext = () => {
    const context = useContext(StrandDataContext)

    if(!context){
        throw Error('useStrandDataContext must be inside an StrandDataContextProvider')
    }

    return context
}