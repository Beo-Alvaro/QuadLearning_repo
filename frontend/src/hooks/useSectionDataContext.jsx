import { SectionDataContext } from '../context/sectionDataContext'
import { useContext } from 'react'

export const useSectionDataContext = () => {
    const context = useContext(SectionDataContext)

    if(!context){
        throw Error('useSectionDataContext must be inside an SectionDataContextProvider')
    }

    return context
}