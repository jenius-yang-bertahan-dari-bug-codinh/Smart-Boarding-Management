import React from 'react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div>
      Room Card: {room.name}
    </div>
  );
};

export default RoomCard;
