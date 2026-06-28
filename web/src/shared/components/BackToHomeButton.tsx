import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type BackToHomeButtonProps = {
  className?: string
}

export default function BackToHomeButton({ className }: BackToHomeButtonProps) {
  return (
    <Button variant="outline" size="sm" className={cn('min-h-8', className)} asChild>
      <Link to="/portal">返回主页</Link>
    </Button>
  )
}
