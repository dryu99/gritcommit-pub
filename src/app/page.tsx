export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-10">GritCommit</h1>
      <CommitmentForm />
    </div>
  );
}

const CommitmentForm = () => {
  return (
    <form className="flex flex-col gap-4 w-[400px]">
      <div className="flex flex-col gap-1">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          className="p-2 rounded-md border border-gray-300"
          placeholder="e.g. 'Finish blog post'"
        />
      </div>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            className="p-2 rounded-md border border-gray-300"
            placeholder="e.g. 20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="p-2 rounded-md border border-gray-300"
            placeholder="Due Date"
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700"
      >
        Create Commitment
      </button>
    </form>
  );
};
