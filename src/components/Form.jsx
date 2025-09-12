// Form UI primitives

function TextInput({ label, type = 'text', value, onChange, name, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-md"
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export { TextInput, SubmitButton }


