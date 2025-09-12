import { useMemo, useState } from 'react'

function ImageGen() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('black-forest-labs/flux-1.1-pro')
  const [aspect, setAspect] = useState('1:1')
  const [customWidth, setCustomWidth] = useState(1024)
  const [customHeight, setCustomHeight] = useState(1024)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(80)
  const [steps, setSteps] = useState(20)
  const [guidance, setGuidance] = useState(3.5)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [image, setImage] = useState(null)

  // Model list is fixed to Flux 1.1 Pro

  const aspectOptions = useMemo(() => ([
    { value: '1:1', label: '1:1 (Square)', w: 1024, h: 1024 },
    { value: '16:9', label: '16:9 (Landscape)', w: 1536, h: 864 },
    { value: '4:3', label: '4:3 (Landscape)', w: 1344, h: 1008 },
    { value: '3:2', label: '3:2 (Landscape)', w: 1536, h: 1024 },
    { value: '2:3', label: '2:3 (Portrait)', w: 1024, h: 1536 },
    { value: '9:16', label: '9:16 (Portrait)', w: 864, h: 1536 },
    { value: 'custom', label: 'Custom (width × height)' }
  ]), [])

  function getDims() {
    if (aspect === 'custom') return { width: Number(customWidth), height: Number(customHeight) }
    const found = aspectOptions.find(a => a.value === aspect)
    return found?.w && found?.h ? { width: found.w, height: found.h } : { width: 1024, height: 1024 }
  }

  async function handleGenerate(e) {
    e?.preventDefault()
    setSubmitting(true)
    setMessage('')
    setIsError(false)
    setImage(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You are not authenticated. Please log in first.')
      }

      const dims = getDims()
      const baseBody = {
        prompt: prompt.trim(),
        format,
        num_outputs: 1,
        guidance_scale: Number(guidance),
        num_inference_steps: Number(steps),
        width: dims.width,
        height: dims.height,
        output_quality: Number(quality)
      }

      const primaryModel = model
      const fallbackModel = 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'

      async function requestWithModel(modelToUse) {
        // Send aspect_ratio for presets and only send width/height when custom
        const body = {
          ...baseBody,
          model: modelToUse,
          aspect_ratio: aspect === 'custom' ? 'custom' : aspect,
          ...(aspect === 'custom' ? { width: dims.width, height: dims.height } : {})
        }
        const res = await fetch('/api/images/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })
        const data = await res.json().catch(() => null)
        return { res, data }
      }

      let { res, data } = await requestWithModel(primaryModel)
      if (!res.ok && (data?.error || data?.message)?.toLowerCase()?.includes('model')) {
        const retry = await requestWithModel(fallbackModel)
        res = retry.res
        data = retry.data
      }

      if (!res.ok) {
        const err = data?.error || data?.message || 'Failed to generate image'
        throw new Error(err)
      }

      const primary = data?.data?.primaryImageBlob || data?.data?.imageUrl || null
      setImage(primary)
      setMessage('')
      setIsError(false)
    } catch (err) {
      setMessage(err?.message || 'Something went wrong')
      setIsError(true)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDownload() {
    if (!image) return
    try {
      const link = document.createElement('a')
      link.href = image
      const ext = (format || 'png').toLowerCase()
      link.download = `generated-image-${Date.now()}.${ext}`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="overflow-hidden rounded-3xl shadow-2xl bg-white/70">
        <div className="grid lg:grid-cols-2">
          <div className="block rounded-2xl h-64 sm:h-80 lg:h-full bg-gradient-to-br from-slate-100 to-slate-200 order-1 lg:order-1">
            <div className="h-full w-full p-6 flex flex-col">
              <h3 className="text-xl font-semibold mb-3 px-2">Preview</h3>
              <div className="flex-1 rounded-xl bg-white overflow-hidden flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="Generated"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-500 text-sm">Generated image will appear here.</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 order-2 lg:order-2">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-4 text-center">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Pexels</div>
                <h2 className="text-2xl sm:text-3xl font-semibold">Image Generation</h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">Describe what you want and tune parameters.</p>
              </div>
              <form onSubmit={handleGenerate} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A serene landscape with mountains at sunset, ultra-detailed..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Model</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="black-forest-labs/flux-1.1-pro">Flux 1.1 Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="webp">WEBP</option>
                      <option value="gif">GIF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Aspect ratio</label>
                    <select
                      value={aspect}
                      onChange={(e) => setAspect(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {aspectOptions.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  {aspect === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Width</label>
                        <input
                          type="number"
                          min={256}
                          max={2048}
                          step={16}
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Height</label>
                        <input
                          type="number"
                          min={256}
                          max={2048}
                          step={16}
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quality: {quality}</label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Steps: {steps}</label>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      step={1}
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Guidance: {guidance}</label>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={guidance}
                      onChange={(e) => setGuidance(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !prompt.trim()}
                    className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? 'Generating...' : 'Generate'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!image}
                    className="w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-gray-800 text-sm font-medium hover:bg-gray-300 disabled:opacity-60"
                  >
                    Download
                  </button>
                  {isError && message && (
                    <span className="w-full sm:w-auto mt-2 sm:mt-0 text-xs sm:text-sm text-red-600">{message}</span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGen


