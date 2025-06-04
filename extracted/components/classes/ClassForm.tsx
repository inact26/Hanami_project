

import React, { useState, useEffect } from 'react';
import { YogaClass, YogaClassFormData, UserRole } from '../../types'; // Removed User as it's not directly used here, only UserRole
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Select } from '../common/Select';
import { DAYS_OF_WEEK } from '../../constants';

interface ClassFormProps {
  initialData?: YogaClass;
  onSave: (data: YogaClassFormData) => void;
  onCancel: () => void;
}

export const ClassForm: React.FC<ClassFormProps> = ({ initialData, onSave, onCancel }) => {
  const { currentUser, users } = useAppContext();
  const [formData, setFormData] = useState<YogaClassFormData>({
    name: '',
    dayOfWeek: 'Lundi',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    totalSlots: 10,
    cancellationWindowHours: 2,
    description: '',
    teacherId: currentUser?.id || '', 
  });
  const [errors, setErrors] = useState<{[K in keyof YogaClassFormData]?: string}>({});

  const teacherOptions = users
    .filter(u => u.role === UserRole.TEACHER)
    .map(t => ({ value: t.id, label: t.name }));

  useEffect(() => {
    if (initialData) {
      const { id, teacherName, ...rest } = initialData; // eslint-disable-line @typescript-eslint/no-unused-vars
      setFormData(rest);
    } else if (currentUser?.role === UserRole.TEACHER) {
      setFormData(prev => ({ ...prev, teacherId: currentUser.id }));
    } else if (currentUser?.role === UserRole.ADMIN && teacherOptions.length > 0) {
      // Default to first teacher if admin is creating and teachers exist
      setFormData(prev => ({...prev, teacherId: teacherOptions[0].value as string}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, currentUser, users]); // Removed teacherOptions from deps as it's derived from users

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalSlots' || name === 'cancellationWindowHours' ? parseInt(value, 10) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: {[K in keyof YogaClassFormData]?: string} = {};
    if (!formData.name.trim()) newErrors.name = "Le nom du cours est requis.";
    if (!formData.location.trim()) newErrors.location = "Le lieu est requis.";
    if (formData.totalSlots <= 0) newErrors.totalSlots = "Le nombre de places doit être positif.";
    if (formData.cancellationWindowHours < 0) newErrors.cancellationWindowHours = "Le délai d'annulation ne peut pas être négatif.";
    if (!formData.teacherId && currentUser?.role === UserRole.ADMIN) newErrors.teacherId = "Un professeur doit être assigné.";
    // Basic time validation
    if (!/^\d{2}:\d{2}$/.test(formData.startTime)) newErrors.startTime = "Format HH:MM requis.";
    if (!/^\d{2}:\d{2}$/.test(formData.endTime)) newErrors.endTime = "Format HH:MM requis.";
    if (formData.startTime >= formData.endTime) newErrors.endTime = "L'heure de fin doit être après l'heure de début.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <Input
        label="Nom du cours"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      {currentUser?.role === UserRole.ADMIN && (
        <Select
          label="Professeur Assigné"
          id="teacherId"
          name="teacherId"
          value={formData.teacherId}
          onChange={handleChange}
          options={teacherOptions}
          error={errors.teacherId}
          required
        />
      )}
      <Textarea
        label="Description (optionnel)"
        id="description"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        rows={3}
      />
       <Select
        label="Jour de la semaine"
        id="dayOfWeek"
        name="dayOfWeek"
        value={formData.dayOfWeek}
        onChange={handleChange}
        options={DAYS_OF_WEEK.map(day => ({ value: day, label: day }))}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
            label="Heure de début"
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
        />
        <Input
            label="Heure de fin"
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={handleChange}
            error={errors.endTime}
            required
        />
      </div>
      <Input
        label="Lieu"
        id="location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        error={errors.location}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
            label="Nombre total de places"
            id="totalSlots"
            name="totalSlots"
            type="number"
            min="1"
            value={formData.totalSlots.toString()}
            onChange={handleChange}
            error={errors.totalSlots} 
            required
        />
        <Input
            label="Délai d'annulation (heures avant)"
            id="cancellationWindowHours"
            name="cancellationWindowHours"
            type="number"
            min="0"
            value={formData.cancellationWindowHours.toString()}
            onChange={handleChange}
            error={errors.cancellationWindowHours}
            required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary">
          {initialData ? "Sauvegarder les modifications" : "Créer le cours"}
        </Button>
      </div>
    </form>
  );
};
