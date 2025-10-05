import { Star } from "lucide-react"

export function ReviewCard({ review }) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold">{review.name}</h4>
            <p className="text-xs text-zinc-400">{review.product}</p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-red-500 text-red-500" />
            ))}
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{review.comment}</p>
        <p className="text-xs text-zinc-400 mt-3">{new Date(review.date).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
