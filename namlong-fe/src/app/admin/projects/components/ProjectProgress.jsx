/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import React, { useState, useRef } from "react";
import {
  Card,
  Text,
  Group,
  Button,
  Modal,
  Stack,
  Textarea,
  Select,
  Image,
  Alert,
  Progress,
  FileInput,
  Grid,
  Badge,
  ActionIcon,
  Tooltip,
  Notification,
} from "@mantine/core";
import {
  IconCamera,
  IconUpload,
  IconProgress,
  IconCheck,
  IconX,
  IconPhoto,
  IconCalendar,
  IconNotes,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { PROJECT_STATUS } from "../../../../constants/formOptions";

export default function ProjectProgress({ 
  project, 
  projectProgress = [], 
  onUpdateProgress,
  onAddProgress 
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    description: '',
    image: null,
    progress_percentage: 0
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Remove hardcoded statusOptions and use centralized constants

  // Start camera for capturing photo
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Sử dụng camera sau nếu có
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
      console.log("Camera started successfully / Khởi động camera thành công");
    } catch (error) {
      console.error("Failed to access camera / Không thể truy cập camera:", error);
      notifications.show({
        title: "Lỗi Camera / Camera Error",
        message: "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập. / Cannot access camera. Please check permissions.",
        color: "red",
        icon: <IconX size={16} />
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `project_progress_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedImage(URL.createObjectURL(blob));
        setFormData(prev => ({ ...prev, image: file }));
        stopCamera();
        console.log("Photo captured successfully / Chụp ảnh thành công");
        notifications.show({
          title: "Thành công / Success",
          message: "Đã chụp ảnh thành công! / Photo captured successfully!",
          color: "green",
          icon: <IconCheck size={16} />
        });
      }, 'image/jpeg', 0.8);
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setFormData(prev => ({ ...prev, image: file }));
      console.log("File uploaded successfully / Tải file thành công");
    }
  };

  // Remove image
  const removeImage = () => {
    setCapturedImage(null);
    setFormData(prev => ({ ...prev, image: null }));
    stopCamera();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.status || !formData.description) {
      notifications.show({
        title: "Lỗi / Error",
        message: "Vui lòng điền đầy đủ thông tin. / Please fill in all required information.",
        color: "red",
        icon: <IconX size={16} />
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const progressData = {
        project_id: project._id,
        status: formData.status,
        description: formData.description,
        progress_percentage: formData.progress_percentage,
        image: formData.image,
        created_date: new Date().toISOString(),
        created_by: 'current_user' // This should be replaced with actual user info
      };

      await onAddProgress?.(progressData);
      
      // Reset form
      setFormData({
        status: '',
        description: '',
        image: null,
        progress_percentage: 0
      });
      setCapturedImage(null);
      close();
      
      console.log("Progress updated successfully / Cập nhật tiến trình thành công");
      notifications.show({
        title: "Thành công / Success",
        message: "Đã cập nhật tiến trình dự án! / Project progress updated successfully!",
        color: "green",
        icon: <IconCheck size={16} />
      });
    } catch (error) {
      console.error("Failed to update progress / Lỗi cập nhật tiến trình:", error);
      notifications.show({
        title: "Lỗi / Error",
        message: "Không thể cập nhật tiến trình. Vui lòng thử lại. / Cannot update progress. Please try again.",
        color: "red",
        icon: <IconX size={16} />
      });
    }
    setIsSubmitting(false);
  };

  // Preview image
  const handlePreviewImage = (imageUrl) => {
    setPreviewImage(imageUrl);
    openPreview();
  };

  // Calculate overall progress
  const overallProgress = projectProgress.length > 0 
    ? Math.round(projectProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / projectProgress.length)
    : 0;

  return (
    <>
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconProgress size={20} />
            <Text fw={600}>Cập nhật tiến trình</Text>
          </Group>
          <Button
            leftSection={<IconCamera size={16} />}
            onClick={open}
            variant="filled"
            size="sm"
          >
            Cập nhật tiến trình
          </Button>
        </Group>

        {/* Overall Progress */}
        <Stack gap="sm" mb="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Tiến độ tổng thể:</Text>
            <Text fw={600}>{overallProgress}%</Text>
          </Group>
          <Progress value={overallProgress} size="lg" />
        </Stack>

        {/* Progress History */}
        <Stack gap="xs">
          <Text size="sm" fw={500} c="dimmed">Lịch sử cập nhật ({projectProgress.length})</Text>
          {projectProgress.length === 0 ? (
            <Text size="sm" c="dimmed" fs="italic">
              Chưa có cập nhật tiến trình nào
            </Text>
          ) : (
            <Stack gap="sm" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {projectProgress.map((progress, index) => (
                <Card key={index} withBorder p="sm" style={{ backgroundColor: '#f8f9fa' }}>
                  <Group justify="space-between" mb="xs">
                    <Badge size="sm" color={
                      progress.status === 'completed' ? 'green' :
                      progress.status === 'in_progress' ? 'blue' :
                      progress.status === 'on_hold' ? 'yellow' : 'red'
                    }>
                      {PROJECT_STATUS.find(s => s.value === progress.status)?.label || progress.status}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {dayjs(progress.created_date).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Group>
                  <Text size="sm" mb="xs">{progress.description}</Text>
                  {progress.progress_percentage > 0 && (
                    <Text size="xs" c="dimmed" mb="xs">
                      Tiến độ: {progress.progress_percentage}%
                    </Text>
                  )}
                  {progress.image && (
                    <Group gap="xs">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color="blue"
                        onClick={() => handlePreviewImage(progress.image)}
                      >
                        <IconEye size={12} />
                      </ActionIcon>
                      <Text size="xs" c="dimmed">Có hình ảnh đính kèm</Text>
                    </Group>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Update Progress Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          stopCamera();
          removeImage();
        }}
        title="Cập nhật tiến trình dự án"
        size="lg"
      >
        <Stack gap="md">
          <Select
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            data={PROJECT_STATUS}
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            required
          />

          <Textarea
            label="Mô tả tiến trình"
            placeholder="Nhập mô tả chi tiết về tiến trình hiện tại..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            minRows={3}
            required
          />

          <div>
            <Text size="sm" fw={500} mb="xs">Phần trăm hoàn thành</Text>
            <Group gap="md" align="center">
              <Progress 
                value={formData.progress_percentage} 
                style={{ flex: 1 }}
                size="lg"
              />
              <Text fw={600} style={{ minWidth: '40px' }}>
                {formData.progress_percentage}%
              </Text>
            </Group>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) }))}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          {/* Camera/Image Section */}
          <div>
            <Text size="sm" fw={500} mb="xs">Hình ảnh tiến trình</Text>
            
            {!capturedImage && !isCameraActive && (
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Button
                    fullWidth
                    variant="light"
                    leftSection={<IconCamera size={16} />}
                    onClick={startCamera}
                  >
                    Chụp ảnh
                  </Button>
                </Grid.Col>
                <Grid.Col span={6}>
                  <FileInput
                    placeholder="Chọn từ thiết bị"
                    accept="image/*"
                    leftSection={<IconUpload size={16} />}
                    onChange={handleFileUpload}
                  />
                </Grid.Col>
              </Grid>
            )}

            {isCameraActive && (
              <Stack gap="md">
                <div style={{ position: 'relative', textAlign: 'center' }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
                <Group justify="center" gap="md">
                  <Button
                    leftSection={<IconCamera size={16} />}
                    onClick={capturePhoto}
                  >
                    Chụp ảnh
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={stopCamera}
                  >
                    Hủy
                  </Button>
                </Group>
              </Stack>
            )}

            {capturedImage && (
              <Stack gap="md">
                <div style={{ textAlign: 'center' }}>
                  <Image
                    src={capturedImage}
                    alt="Captured progress"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <Group justify="center" gap="md">
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={removeImage}
                  >
                    Xóa ảnh
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<IconCamera size={16} />}
                    onClick={() => {
                      removeImage();
                      startCamera();
                    }}
                  >
                    Chụp lại
                  </Button>
                </Group>
              </Stack>
            )}
          </div>

          <Group justify="flex-end" gap="md">
            <Button
              variant="light"
              onClick={() => {
                close();
                stopCamera();
                removeImage();
              }}
            >
              Hủy
            </Button>
            <Button
              loading={isSubmitting}
              onClick={handleSubmit}
              leftSection={<IconCheck size={16} />}
            >
              Cập nhật tiến trình
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title="Xem hình ảnh"
        size="lg"
        centered
      >
        {previewImage && (
          <Image
            src={previewImage}
            alt="Progress image"
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </>
  );
} 