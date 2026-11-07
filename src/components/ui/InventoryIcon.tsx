import type { ComponentType, SVGProps } from 'react'

import { Archive } from 'pixelarticons/react/Archive.js'
import { FileText } from 'pixelarticons/react/FileText.js'
import { Folder } from 'pixelarticons/react/Folder.js'
import { Notebook } from 'pixelarticons/react/Notebook.js'
import { Pencil } from 'pixelarticons/react/Pencil.js'
import { Scissors } from 'pixelarticons/react/Scissors.js'
import { Clipboard } from 'pixelarticons/react/Clipboard.js'
import { Shirt } from 'pixelarticons/react/Shirt.js'
import { Sticker } from 'pixelarticons/react/Sticker.js'
import { Flag } from 'pixelarticons/react/Flag.js'
import { Image } from 'pixelarticons/react/Image.js'
import { Trophy } from 'pixelarticons/react/Trophy.js'
import { Clock } from 'pixelarticons/react/Clock.js'
import { Briefcase } from 'pixelarticons/react/Briefcase.js'
import { Package } from 'pixelarticons/react/Package.js'
import { Box } from 'pixelarticons/react/Box.js'
import { Sofa } from 'pixelarticons/react/Sofa.js'
import { Teach } from 'pixelarticons/react/Teach.js'
import { Presentation } from 'pixelarticons/react/Presentation.js'
import { Camera } from 'pixelarticons/react/Camera.js'
import { Video } from 'pixelarticons/react/Video.js'
import { Printer } from 'pixelarticons/react/Printer.js'
import { Projector } from 'pixelarticons/react/Projector.js'
import { Monitor } from 'pixelarticons/react/Monitor.js'
import { Computer } from 'pixelarticons/react/Computer.js'
import { Keyboard } from 'pixelarticons/react/Keyboard.js'
import { Mouse } from 'pixelarticons/react/Mouse.js'
import { Mic } from 'pixelarticons/react/Mic.js'
import { Radio } from 'pixelarticons/react/Radio.js'
import { Volume3 } from 'pixelarticons/react/Volume3.js'
import { Spotlight } from 'pixelarticons/react/Spotlight.js'
import { Lightbulb } from 'pixelarticons/react/Lightbulb.js'
import { Plug } from 'pixelarticons/react/Plug.js'
import { Zap } from 'pixelarticons/react/Zap.js'
import { Usb } from 'pixelarticons/react/Usb.js'
import { Wifi } from 'pixelarticons/react/Wifi.js'
import { Database } from 'pixelarticons/react/Database.js'
import { MemoryStick } from 'pixelarticons/react/MemoryStick.js'
import { Battery } from 'pixelarticons/react/Battery.js'
import { CircuitBoard } from 'pixelarticons/react/CircuitBoard.js'
import { Tools } from 'pixelarticons/react/Tools.js'
import { ToolCase } from 'pixelarticons/react/ToolCase.js'
import { Coffee } from 'pixelarticons/react/Coffee.js'
import { Mug } from 'pixelarticons/react/Mug.js'
import { Trash } from 'pixelarticons/react/Trash.js'
import { Tent } from 'pixelarticons/react/Tent.js'
import { Chess } from 'pixelarticons/react/Chess.js'
import { Balloon } from 'pixelarticons/react/Balloon.js'
import { Lock } from 'pixelarticons/react/Lock.js'
import { Cloud } from 'pixelarticons/react/Cloud.js'
import { MapPinHome } from 'pixelarticons/react/MapPinHome.js'

import type { InventoryIconName } from '@/lib/inventory'

const ICONS: Record<InventoryIconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  'archive': Archive,
  'file-text': FileText,
  'folder': Folder,
  'notebook': Notebook,
  'pencil': Pencil,
  'scissors': Scissors,
  'clipboard': Clipboard,
  'shirt': Shirt,
  'sticker': Sticker,
  'flag': Flag,
  'image': Image,
  'trophy': Trophy,
  'clock': Clock,
  'briefcase': Briefcase,
  'package': Package,
  'box': Box,
  'sofa': Sofa,
  'teach': Teach,
  'presentation': Presentation,
  'camera': Camera,
  'video': Video,
  'printer': Printer,
  'projector': Projector,
  'monitor': Monitor,
  'computer': Computer,
  'keyboard': Keyboard,
  'mouse': Mouse,
  'mic': Mic,
  'radio': Radio,
  'volume-3': Volume3,
  'spotlight': Spotlight,
  'lightbulb': Lightbulb,
  'plug': Plug,
  'zap': Zap,
  'usb': Usb,
  'wifi': Wifi,
  'database': Database,
  'memory-stick': MemoryStick,
  'battery': Battery,
  'circuit-board': CircuitBoard,
  'tools': Tools,
  'tool-case': ToolCase,
  'coffee': Coffee,
  'mug': Mug,
  'trash': Trash,
  'tent': Tent,
  'chess': Chess,
  'balloon': Balloon,
  'lock': Lock,
  'cloud': Cloud,
  'map-pin-home': MapPinHome,
}

/** Ikon piksel (pixelarticons, MIT) untuk barang inventaris; nama ikon disimpan di field `icon` koleksi Inventaris. */
export function InventoryIcon({ name, className = 'size-5' }: { name?: string | null; className?: string }) {
  const Icon = ICONS[(name ?? 'package') as InventoryIconName] ?? Package
  return <Icon className={className} aria-hidden="true" focusable="false" />
}
