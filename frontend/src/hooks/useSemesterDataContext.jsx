import { SemesterDataContext } from '../context/semesterDataContext'
import { useContext } from 'react'

export const useSemesterDataContext = () => {
    const context = useContext(SemesterDataContext)

    if(!context){
        throw Error('useSemesterDataContext must be inside an SemesterDataContextProvider')
    }

    return context
}