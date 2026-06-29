import { Camera, Check, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAuth } from '../../../shared/hooks/use-auth'
import AvatarCropDialog from '../../../shared/components/AvatarCropDialog'
import MemberAvatar from '../../../shared/components/MemberAvatar'
import SwipeRow from '../../../shared/components/ui/SwipeRow'
import {
  MEMBER_COLORS,
  useCreateFamilyMember,
  useDeleteFamilyMember,
  useFamilyMembers,
  useUpdateFamilyMember,
  type FamilyMember,
} from '../../../shared/hooks/use-family-members'
import { removeMemberAvatar, uploadMemberAvatar } from '../../../shared/lib/upload-member-avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'

export default function MemberManagePanel() {
  const { session } = useAuth()
  const userId = session?.user.id
  const { data: members = [] } = useFamilyMembers()
  const createMember = useCreateFamilyMember()
  const updateMember = useUpdateFamilyMember()
  const deleteMember = useDeleteFamilyMember()

  const [addingMember, setAddingMember] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(MEMBER_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState<string>(MEMBER_COLORS[0])
  const [cropMember, setCropMember] = useState<FamilyMember | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [uploadPending, setUploadPending] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<FamilyMember | null>(null)

  async function handleConfirmAdd() {
    if (!newName.trim()) return
    await createMember.mutateAsync({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(MEMBER_COLORS[0])
    setAddingMember(false)
  }

  function openFilePicker(member: FamilyMember) {
    uploadTargetRef.current = member
    fileRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    const member = uploadTargetRef.current
    if (!file || !member) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropMember(member)
      setCropImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm(blob: Blob) {
    if (!cropMember || !userId) return
    setUploadPending(true)
    try {
      const url = await uploadMemberAvatar(userId, cropMember.id, blob)
      await updateMember.mutateAsync({ id: cropMember.id, avatarUrl: url })
      setCropImageSrc(null)
      setCropMember(null)
    } finally {
      setUploadPending(false)
    }
  }

  async function handleRemoveAvatar(member: FamilyMember) {
    if (!userId) return
    await removeMemberAvatar(userId, member.id)
    await updateMember.mutateAsync({ id: member.id, avatarUrl: null })
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <ul className="space-y-2">
        {members.map((member) => (
          <li key={member.id}>
            {editingId === member.id ? (
              <form
                className="space-y-2 rounded-xl border border-border/60 bg-card p-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  await updateMember.mutateAsync({
                    id: member.id,
                    name: editName,
                    color: editColor,
                  })
                  setEditingId(null)
                }}
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={fieldClass}
                />
                <div className="flex flex-wrap gap-1">
                  {MEMBER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        'size-6 rounded-full',
                        editColor === c && 'ring-2 ring-primary ring-offset-1',
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
                <Button type="submit" size="sm">
                  保存
                </Button>
              </form>
            ) : members.length > 1 ? (
              <SwipeRow onDelete={() => deleteMember.mutate(member.id)}>
                <MemberRow
                  member={member}
                  onEdit={() => {
                    setEditingId(member.id)
                    setEditName(member.name)
                    setEditColor(member.color)
                  }}
                  onPickAvatar={() => openFilePicker(member)}
                  onRemoveAvatar={() => void handleRemoveAvatar(member)}
                />
              </SwipeRow>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card">
                <MemberRow
                  member={member}
                  onEdit={() => {
                    setEditingId(member.id)
                    setEditName(member.name)
                    setEditColor(member.color)
                  }}
                  onPickAvatar={() => openFilePicker(member)}
                  onRemoveAvatar={() => void handleRemoveAvatar(member)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {addingMember ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 bg-card p-3">
          <div className="min-w-0 flex-1 space-y-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="成员名称"
              autoFocus
              className={fieldClass}
            />
            <div className="flex flex-wrap gap-1">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    'size-6 rounded-full',
                    newColor === c && 'ring-2 ring-primary ring-offset-1',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleConfirmAdd()}
            disabled={createMember.isPending || !newName.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
            aria-label="确认添加"
          >
            <Check className="size-5" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setAddingMember(true)}
        >
          <Plus className="size-4" />
          添加成员
        </Button>
      )}

      {cropImageSrc && cropMember ? (
        <AvatarCropDialog
          open
          imageSrc={cropImageSrc}
          onClose={() => {
            setCropImageSrc(null)
            setCropMember(null)
          }}
          onConfirm={handleCropConfirm}
          isPending={uploadPending}
        />
      ) : null}
    </>
  )
}

function MemberRow({
  member,
  onEdit,
  onPickAvatar,
  onRemoveAvatar,
}: {
  member: FamilyMember
  onEdit: () => void
  onPickAvatar: () => void
  onRemoveAvatar: () => void
}) {
  return (
    <div className="flex items-center gap-3 bg-card p-3">
      <MemberAvatar member={member} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}</p>
        <div className="mt-1 flex gap-2">
          <button type="button" className="text-xs text-primary" onClick={onPickAvatar}>
            <Camera className="mr-0.5 inline size-3.5" />
            头像
          </button>
          {member.avatarUrl ? (
            <button
              type="button"
              className="text-xs text-muted-foreground"
              onClick={onRemoveAvatar}
            >
              移除头像
            </button>
          ) : null}
        </div>
      </div>
      <button type="button" className="text-xs text-primary" onClick={onEdit}>
        编辑
      </button>
    </div>
  )
}
