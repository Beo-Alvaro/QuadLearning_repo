import { SubjectDataContext } from '../context/subjectDataContext'
import { useContext } from 'react'

export const useSubjectDataContext = () => {
    const context = useContext(SubjectDataContext)

    if(!context){
        throw Error('useSubjectDataContext must be inside an SubjectDataContextProvider')
    }

    return context
}