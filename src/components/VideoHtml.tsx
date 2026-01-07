export default function VideoHtml({ src='', className = '', id = '', controls = true, preload = 'false' }) {
  const fileName = () => {
    const file = src?.split('/')?.pop()
    return file||''
  }

  const extName = () => {
    const file = fileName()
 return file.split('.')?.pop()?.split('?')?.[0]
  }

  return <>
    <video
      className={className}
      preload={preload}
      id={id}
      controls={controls}
    >
      <source src={src} type={`video/${extName()}`} />
    </video>
  </>
}