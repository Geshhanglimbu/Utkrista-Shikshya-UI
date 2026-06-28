import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import './UploadBox.css'

// Drag & drop upload component. Calls onFile(file) when a file is dropped or picked.
export default function UploadBox({ onFile, accept = 'image/*', hint = 'PNG, JPG up to 10MB' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)

  const handleFiles = (files) => {
    if (files && files[0]) {
      setFileName(files[0].name)
      onFile && onFile(files[0])
    }
  }

  return (
    <div
      className={`upload-box ${dragging ? 'is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => handleFiles(e.target.files)} />
      <UploadCloud size={28} className="upload-box__icon" />
      <p className="upload-box__title">{fileName || 'Drag & Drop Image'}</p>
      <p className="upload-box__hint">{hint}</p>
      <span className="upload-box__or">Or browse files on your computer</span>
    </div>
  )
}
