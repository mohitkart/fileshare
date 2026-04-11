/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useEffect, useRef, useState } from "react"

function LoadMore({ children, load }: { children: any, load: () => void }) {
    const divRef = useRef<any>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                load()
            }
        }, { threshold: 1 })
        observer.observe(divRef.current)

        return () => {
            observer.disconnect()
        }
    }, [])
    return <div ref={divRef}>{children}</div>
}

const Virtualization = function Virtualization({ list = [], count = 10, RenderComponent }: { list: any[], count: number, RenderComponent: any }) {
    const [page, setPage] = useState(0)
    const [data, setData] = useState<any[]>([])
    const dataRef = useRef<any>({ total: 0 })


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1)
    }, [list.length])

    useEffect(() => {
        dataRef.current.total = data.length
    }, [data.length])

    useEffect(() => {
        if (page) {
            if (list.length) {
                if (page == 1) {
                    const arr = list.slice(0, count)
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setData([...arr])
                } else {
                    const arr = list.slice((page - 1) * count, count * page)
                    setData(prev => ([...prev, ...arr]))
                }
            } else {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setData([])
            }
        }
    }, [page,list.length])

    const loadMore = () => {
        const length = dataRef.current.total
        const pageLength = Math.ceil(length / count);
        setPage(pageLength + 1)
    }

    return <>
        {data.map((item, i) => {
            return <RenderComponent key={item.id || i} item={item} index={i} />
        })}

        {data.length < list.length ? <>
            <LoadMore load={loadMore}>
                <div>Loading...</div>
            </LoadMore>
        </> : <></>}
    </>
}

export default memo(Virtualization)