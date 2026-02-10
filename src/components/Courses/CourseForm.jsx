import React, { useState, useEffect } from 'react';

const CourseForm = ({ initialData = {}, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    course_type: 'free',
    youtube_url: '',
    thumbnail_url: '',
    is_published: true,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.course_type === 'paid' && formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0 for paid courses';
    }
    
    if (formData.youtube_url && !formData.youtube_url.includes('youtube.com') && !formData.youtube_url.includes('youtu.be')) {
      newErrors.youtube_url = 'Please enter a valid YouTube URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter course title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter course description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="course_type"
                value="free"
                checked={formData.course_type === 'free'}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="course_type"
                value="paid"
                checked={formData.course_type === 'paid'}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Paid</span>
            </label>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (USD) {formData.course_type === 'paid' && '*'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={formData.course_type === 'free'}
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } ${formData.course_type === 'free' ? 'bg-gray-100' : ''}`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      </div>

      {/* YouTube URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube Video URL
        </label>
        <input
          type="url"
          name="youtube_url"
          value={formData.youtube_url}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.youtube_url ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {errors.youtube_url && (
          <p className="mt-1 text-sm text-red-600">{errors.youtube_url}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Enter the YouTube video URL for this course
        </p>
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail URL
        </label>
        <input
          type="url"
          name="thumbnail_url"
          value={formData.thumbnail_url}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the URL for the course thumbnail image
        </p>
      </div>

      {/* Publish Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_published"
          id="is_published"
          checked={formData.is_published}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
          Publish this course immediately
        </label>
      </div>

      {/* Submit button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            'Save Course'
          )}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;