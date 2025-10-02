/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React from "react";
import { Card, Text, Title, Button, Grid, Container, Group, Badge, Stack, SimpleGrid, Modal, List, TextInput, Textarea, Select, Alert, Notification, ThemeIcon, Divider, Paper } from "@mantine/core";
import { IconChevronRight, IconCertificate, IconUsers, IconTrophy, IconInfoCircle, IconMail, IconUser, IconPhone, IconCheck, IconX, IconSchool, IconHeart, IconTarget, IconBookmark, IconAward, IconClipboardList, IconBulb } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "./components/Footer";

// Mở rộng chương trình ICDL từ lớp 1-9 
const icdlPrograms = [
  {
    id: 1,
    name: "Chương trình ICDL lớp 1",
    desc: "MÔ-ĐUN: INTRODUCTION TO CODING 1 - LÀM QUEN VỚI LẬP TRÌNH 1",
    image: "/product.png",
    level: "Cơ bản",
    color: "blue",
    details: {
      objective: "Giới thiệu các khái niệm cơ bản về lập trình và tư duy logic",
      content: [
        "Làm quen với môi trường lập trình",
        "Hiểu biết về thuật toán cơ bản",
        "Thực hành với các bài tập đơn giản",
        "Phát triển tư duy logic và giải quyết vấn đề"
      ],
      requirements: "Không yêu cầu kiến thức trước",
      certification: "Chứng chỉ ICDL Coding 1",
      benefits: [
        "Phát triển tư duy logic và phân tích",
        "Làm quen với các công cụ lập trình cơ bản",
        "Xây dựng nền tảng vững chắc cho các khóa học tiếp theo"
      ]
    }
  },
  {
    id: 2,
    name: "Chương trình ICDL lớp 2",
    desc: "MÔ-ĐUN: INTRODUCTION TO CODING 2 - LÀM QUEN VỚI LẬP TRÌNH 2",
    image: "/product.png",
    level: "Cơ bản",
    color: "blue",
    details: {
      objective: "Tiếp tục phát triển kỹ năng lập trình với các khái niệm nâng cao hơn",
      content: [
        "Cấu trúc dữ liệu cơ bản",
        "Vòng lặp và điều kiện",
        "Hàm và thủ tục",
        "Debug và xử lý lỗi cơ bản"
      ],
      requirements: "Hoàn thành lớp 1 hoặc có kiến thức tương đương",
      certification: "Chứng chỉ ICDL Coding 2",
      benefits: [
        "Nắm vững các cấu trúc lập trình cơ bản",
        "Kỹ năng debug và giải quyết vấn đề",
        "Chuẩn bị tốt cho lập trình nâng cao"
      ]
    }
  },
  {
    id: 3,
    name: "Chương trình ICDL lớp 3",
    desc: "MÔ-ĐUN: LÀM QUEN VỚI THẾ GIỚI SỐ (FIRST STEPS)",
    image: "/product.png",
    level: "Trung cấp",
    color: "green",
    details: {
      objective: "Khám phá thế giới công nghệ số và ứng dụng thực tế",
      content: [
        "Hiểu biết về công nghệ số",
        "Internet và mạng máy tính",
        "An toàn thông tin cơ bản",
        "Công cụ số trong cuộc sống"
      ],
      requirements: "Hoàn thành lớp 2",
      certification: "Chứng chỉ ICDL Digital World",
      benefits: [
        "Hiểu biết toàn diện về thế giới số",
        "Kỹ năng sử dụng internet an toàn",
        "Nền tảng cho công dân số tương lai"
      ]
    }
  },
  {
    id: 4,
    name: "Chương trình ICDL lớp 4",
    desc: "MÔ-ĐUN: LÀM QUEN VỚI CÁC ỨNG DỤNG MÁY TÍNH (APPLICATION BASICS)",
    image: "/product.png",
    level: "Trung cấp",
    color: "green",
    details: {
      objective: "Sử dụng thành thạo các ứng dụng máy tính cơ bản",
      content: [
        "Microsoft Office cơ bản",
        "Xử lý văn bản Word",
        "Bảng tính Excel cơ bản",
        "Trình bày PowerPoint"
      ],
      requirements: "Hoàn thành lớp 3",
      certification: "Chứng chỉ ICDL Applications",
      benefits: [
        "Thành thạo các ứng dụng văn phòng",
        "Kỹ năng cần thiết cho học tập và công việc",
        "Hiệu quả trong xử lý thông tin"
      ]
    }
  },
  {
    id: 5,
    name: "Chương trình ICDL lớp 5",
    desc: "MÔ-ĐUN: LÀM QUEN VỚI MẠNG TRỰC TUYẾN (ONLINE BASICS)",
    image: "/product.png",
    level: "Nâng cao",
    color: "orange",
    details: {
      objective: "Khai thác hiệu quả các dịch vụ và công cụ trực tuyến",
      content: [
        "Duyệt web hiệu quả",
        "Email và giao tiếp trực tuyến",
        "Mạng xã hội và cộng tác",
        "Lưu trữ đám mây"
      ],
      requirements: "Hoàn thành lớp 4",
      certification: "Chứng chỉ ICDL Online",
      benefits: [
        "Khai thác tối đa công cụ trực tuyến",
        "Giao tiếp và cộng tác hiệu quả",
        "Quản lý thông tin số chuyên nghiệp"
      ]
    }
  },
  {
    id: 6,
    name: "Chương trình ICDL lớp 6",
    desc: "MÔ-ĐUN: NÂNG CAO KỸ NĂNG LẬP TRÌNH (ADVANCED CODING)",
    image: "/product.png",
    level: "Nâng cao",
    color: "orange",
    details: {
      objective: "Phát triển kỹ năng lập trình nâng cao và tư duy giải quyết vấn đề",
      content: [
        "Lập trình hướng đối tượng",
        "Cấu trúc dữ liệu nâng cao",
        "Thuật toán tìm kiếm và sắp xếp",
        "Dự án lập trình thực tế"
      ],
      requirements: "Hoàn thành lớp 5",
      certification: "Chứng chỉ ICDL Advanced Coding",
      benefits: [
        "Tư duy lập trình chuyên nghiệp",
        "Kỹ năng giải quyết vấn đề phức tạp",
        "Chuẩn bị cho lập trình viên tương lai"
      ]
    }
  },
  {
    id: 7,
    name: "Chương trình ICDL lớp 7",
    desc: "MÔ-ĐUN: CƠ SỞ DỮ LIỆU VÀ QUẢN LÝ THÔNG TIN (DATABASE FUNDAMENTALS)",
    image: "/product.png",
    level: "Nâng cao",
    color: "orange",
    details: {
      objective: "Hiểu và sử dụng cơ sở dữ liệu để quản lý thông tin",
      content: [
        "Thiết kế cơ sở dữ liệu",
        "SQL cơ bản và nâng cao",
        "Microsoft Access",
        "Báo cáo và phân tích dữ liệu"
      ],
      requirements: "Hoàn thành lớp 6",
      certification: "Chứng chỉ ICDL Database",
      benefits: [
        "Quản lý dữ liệu chuyên nghiệp",
        "Kỹ năng phân tích thông tin",
        "Nền tảng cho Big Data và AI"
      ]
    }
  },
  {
    id: 8,
    name: "Chương trình ICDL lớp 8",
    desc: "MÔ-ĐUN: THIẾT KẾ VÀ PHÁT TRIỂN WEB (WEB DEVELOPMENT)",
    image: "/product.png",
    level: "Chuyên nghiệp",
    color: "red",
    details: {
      objective: "Xây dựng và thiết kế trang web cơ bản",
      content: [
        "HTML5 và CSS3",
        "JavaScript cơ bản",
        "Thiết kế responsive",
        "Công cụ phát triển web"
      ],
      requirements: "Hoàn thành lớp 7",
      certification: "Chứng chỉ ICDL Web Development",
      benefits: [
        "Kỹ năng thiết kế web hiện đại",
        "Hiểu biết về UI/UX cơ bản",
        "Cơ hội nghề nghiệp trong IT"
      ]
    }
  },
  {
    id: 9,
    name: "Chương trình ICDL lớp 9",
    desc: "MÔ-ĐUN: DỰ ÁN TÍCH HỢP VÀ CHUYÊN NGHIỆP HÓA (CAPSTONE PROJECT)",
    image: "/product.png",
    level: "Chuyên nghiệp",
    color: "red",
    details: {
      objective: "Tích hợp tất cả kiến thức đã học vào một dự án thực tế",
      content: [
        "Phân tích yêu cầu dự án",
        "Thiết kế hệ thống tổng thể",
        "Phát triển ứng dụng hoàn chỉnh",
        "Thuyết trình và bảo vệ dự án"
      ],
      requirements: "Hoàn thành lớp 8",
      certification: "Chứng chỉ ICDL Professional",
      benefits: [
        "Kinh nghiệm dự án thực tế",
        "Kỹ năng làm việc nhóm",
        "Chuẩn bị cho môi trường làm việc chuyên nghiệp"
      ]
    }
  },
];

export default function HomePage() {
  const [selectedProgram, setSelectedProgram] = React.useState(null);
  const [detailsOpened, setDetailsOpened] = React.useState(false);
  const [consultationOpened, setConsultationOpened] = React.useState(false);
  const [selectedProgramForConsultation, setSelectedProgramForConsultation] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form tư vấn chung
  const consultationForm = useForm({
    initialValues: {
      fullName: '',
      phone: '',
      email: '',
      organization: '',
      inquiryType: '',
      message: ''
    },
    validate: {
      fullName: (value) => (!value ? 'Vui lòng nhập họ tên' : null),
      phone: (value) => (!value ? 'Vui lòng nhập số điện thoại' : null),
      email: (value) => (!/^\S+@\S+$/.test(value) ? 'Email không hợp lệ' : null),
    },
  });

  const handleLearnMore = (program) => {
    setSelectedProgram(program);
    setDetailsOpened(true);
  };

  const handleConsultationSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Simulate API call - replace with actual email service
      const programInfo = selectedProgramForConsultation ? `Chương trình quan tâm: ${selectedProgramForConsultation.name}` : '';
      
      const emailData = {
        to: 'giaoducnamlong@gmail.com',
        subject: selectedProgramForConsultation ? 
          `Tư vấn chương trình ICDL: ${selectedProgramForConsultation.name}` : 
          'Yêu cầu tư vấn về ICDL từ website',
        html: `
          <h3>🎓 Yêu cầu tư vấn ICDL mới</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Họ tên:</strong> ${values.fullName}</p>
            <p><strong>📞 Số điện thoại:</strong> ${values.phone}</p>
            <p><strong>📧 Email:</strong> ${values.email}</p>
            <p><strong>🏫 Trường/Tổ chức:</strong> ${values.organization || 'Không có thông tin'}</p>
            <p><strong>📋 Loại tư vấn:</strong> ${values.inquiryType || 'Tư vấn chung'}</p>
            ${programInfo ? `<p><strong>📚 ${programInfo}</strong></p>` : ''}
            <p><strong>💬 Nội dung:</strong> ${values.message || 'Không có thông tin bổ sung'}</p>
          </div>
          <p style="color: #666; font-size: 14px;"><em>📅 Gửi từ website vào lúc: ${new Date().toLocaleString('vi-VN')}</em></p>
        `
      };

      // Here you would call your email service API
      console.log('Sending consultation email:', emailData);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show professional success notification
      notifications.show({
        title: '🎉 Gửi yêu cầu thành công!',
        message: 'Cảm ơn bạn đã quan tâm đến chương trình ICDL. Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ tới.',
        color: 'green',
        icon: <IconCheck size={20} />,
        autoClose: 5000,
        style: { marginTop: '60px' }
      });
      
      consultationForm.reset();
      setTimeout(() => {
        setConsultationOpened(false);
        setSelectedProgramForConsultation(null);
      }, 1000);
    } catch (error) {
      notifications.show({
        title: '❌ Có lỗi xảy ra',
        message: 'Không thể gửi yêu cầu. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua hotline.',
        color: 'red',
        icon: <IconX size={20} />,
        autoClose: 5000,
        style: { marginTop: '60px' }
      });
    }
    setIsSubmitting(false);
  };

  const handleRequestConsultation = (program = null) => {
    setSelectedProgramForConsultation(program);
    setConsultationOpened(true);
  };

  return (
    <div className="w-full max-w-[1440px] m-auto">
      <Header />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="relative h-[600px] w-full">
            <Image
              src="/banner3.jpg"
              alt="Hero Banner"
              fill
              style={{ 
                objectFit: "cover",
                objectPosition: "center center"
              }}
              priority
              className="brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <Title order={1} className="text-white !text-5xl md:!text-6xl mb-6 font-bold drop-shadow-lg">
                GIÁO DỤC NAM LONG
              </Title>
              <Text size="xl" className="text-white mb-4 opacity-95 max-w-2xl mx-auto leading-relaxed">
                Đối tác tin cậy cung cấp chương trình ICDL cho các trường học
              </Text>
              <Text size="lg" className="text-white mb-8 opacity-90 max-w-2xl mx-auto">
                Giúp phụ huynh hiểu rõ về chứng chỉ ICDL quốc tế và lợi ích cho con em
              </Text>
              <Group justify="center" gap="md">
                <Button 
                  size="xl" 
                  color="blue" 
                  rightSection={<IconChevronRight size={20} />}
                  className="shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => handleRequestConsultation()}
                >
                  Tư vấn miễn phí
                </Button>
              </Group>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-blue-50">
          <Container size="xl">
            <div className="text-center mb-12">
              <Title order={2} className="text-[#153e6d] mb-4">
                Tại sao chọn chương trình ICDL?
              </Title>
              <Text size="lg" className="text-gray-600 max-w-3xl mx-auto">
                ICDL (International Computer Driving Licence) là chứng chỉ tin học quốc tế được công nhận tại hơn 150 quốc gia, 
                giúp học sinh phát triển kỹ năng công nghệ thông tin cần thiết cho tương lai
              </Text>
            </div>
            
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              <Card shadow="sm" padding="xl" className="text-center h-full">
                <IconCertificate size={48} className="text-blue-600 mx-auto mb-4" />
                <Title order={4} mb="md">Chứng chỉ quốc tế</Title>
                <Text c="dimmed">
                  Được công nhận tại 150+ quốc gia, tạo lợi thế khi du học và làm việc quốc tế
                </Text>
              </Card>
              
              <Card shadow="sm" padding="xl" className="text-center h-full">
                <IconSchool size={48} className="text-green-600 mx-auto mb-4" />
                <Title order={4} mb="md">Chương trình chuẩn</Title>
                <Text c="dimmed">
                  Giáo trình được thiết kế bài bản, phù hợp từ cấp tiểu học đến trung học phổ thông
                </Text>
              </Card>
              
              <Card shadow="sm" padding="xl" className="text-center h-full">
                <IconHeart size={48} className="text-red-600 mx-auto mb-4" />
                <Title order={4} mb="md">Hỗ trợ tận tâm</Title>
                <Text c="dimmed">
                  Đội ngũ chuyên nghiệp luôn sẵn sàng hỗ trợ các trường và phụ huynh
                </Text>
              </Card>
            </SimpleGrid>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <Container size="xl">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <IconUsers size={32} className="text-blue-600" />
                </div>
                <Text size="3xl" fw={700} className="text-[#153e6d] mb-2">5000+</Text>
                <Text size="lg" c="dimmed">Học sinh đã được đào tạo</Text>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <IconTrophy size={32} className="text-green-600" />
                </div>
                <Text size="3xl" fw={700} className="text-[#153e6d] mb-2">95%</Text>
                <Text size="lg" c="dimmed">Tỷ lệ đậu chứng chỉ</Text>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <IconSchool size={32} className="text-orange-600" />
                </div>
                <Text size="3xl" fw={700} className="text-[#153e6d] mb-2">50+</Text>
                <Text size="lg" c="dimmed">Trường đối tác</Text>
              </div>
            </SimpleGrid>
          </Container>
        </section>

        {/* Programs Section */}
        <section className="py-16 bg-[#153e6d]">
          <Container size="xl">
            <div className="text-center mb-12">
              <Title order={2} className="text-white !text-4xl mb-4">
                Các Chương Trình ICDL
              </Title>
              <Text size="lg" className="text-white opacity-90 mb-8">
                9 chương trình ICDL từ cơ bản đến chuyên nghiệp, phù hợp với mọi lứa tuổi học sinh
              </Text>
            </div>
            
            <Grid
              justify="center"
              gutter="lg"
              styles={{ inner: { alignItems: "stretch" } }}
            >
              {icdlPrograms.map((program) => (
                <Grid.Col key={program.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    shadow="lg"
                    padding="xl"
                    radius="md"
                    withBorder
                    className="items-center h-full bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <Image
                        src={program.image}
                        alt={program.name}
                        height={160}
                        width={160}
                        className="mx-auto mb-4"
                      />
                      
                      <Stack gap="md">
                        <div>
                          <Badge 
                            color="blue" 
                            variant="light" 
                            mb="xs"
                            size="lg"
                          >
                            ICDL
                          </Badge>
                          <Text size="lg" fw={700} className="!text-blue-600 mb-2">
                            {program.name}
                          </Text>
                          <Text className="text-gray-600" fw={400} size="sm" lineClamp={3}>
                            {program.desc}
                          </Text>
                        </div>

                        <Group justify="center" gap="xs">
                          <Badge color={program.color} variant="outline">
                            {program.level}
                          </Badge>
                        </Group>
                        
                        <Group justify="center" gap="xs">
                          <Button 
                            variant="outline" 
                            color="blue" 
                            size="sm"
                            leftSection={<IconInfoCircle size={16} />}
                            onClick={() => handleLearnMore(program)}
                          >
                            Tìm hiểu thêm
                          </Button>
                          <Button 
                            color="blue" 
                            size="sm"
                            onClick={() => handleRequestConsultation(program)}
                          >
                            Tư vấn
                          </Button>
                        </Group>
                      </Stack>
                    </div>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Container>
        </section>

        {/* Contact CTA Section */}
        <section className="py-16 bg-gray-50">
          <Container size="xl">
            <div className="text-center">
              <Title order={2} className="text-[#153e6d] mb-4">
                Quan tâm đến chương trình ICDL cho trường?
              </Title>
              <Text size="lg" className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Liên hệ với chúng tôi để được tư vấn miễn phí về cách triển khai chương trình ICDL tại trường học
              </Text>
              
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" className="mb-8">
                <div className="text-center">
                  <Text fw={600} size="lg" className="text-[#153e6d] mb-2">
                    📞 Hotline tư vấn
                  </Text>
                  <Text size="xl" fw={700}>0913.176.858</Text>
                </div>
                
                <div className="text-center">
                  <Text fw={600} size="lg" className="text-[#153e6d] mb-2">
                    ✉️ Email
                  </Text>
                  <Text size="xl" fw={700}>giaoducnamlong@gmail.com</Text>
                </div>
                
                <div className="text-center">
                  <Text fw={600} size="lg" className="text-[#153e6d] mb-2">
                    📍 Địa chỉ
                  </Text>
                  <Text size="md" fw={500}>156/8 Lê Đình Cẩn, Bình Tân, HCM</Text>
                </div>
              </SimpleGrid>

              <Group justify="center" gap="md">
                <Button 
                  size="xl" 
                  color="blue"
                  onClick={() => handleRequestConsultation()}
                >
                  Đăng ký tư vấn ngay
                </Button>
              </Group>
            </div>
          </Container>
        </section>
      </main>

      {/* Enhanced Program Details Modal */}
      <Modal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        title=""
        size="xl"
        centered
        styles={{
          content: { padding: 0 },
          header: { display: 'none' }
        }}
      >
        {selectedProgram && (
          <div>
            {/* Header with gradient background */}
            <div 
              style={{
                background: `linear-gradient(135deg, var(--mantine-color-${selectedProgram.color}-6), var(--mantine-color-${selectedProgram.color}-8))`,
                color: 'white',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Group justify="space-between" align="flex-start" mb="md">
                  <Badge 
                    size="lg" 
                    variant="white" 
                    color={selectedProgram.color}
                    leftSection={<IconCertificate size={16} />}
                  >
                    Chứng chỉ ICDL
                  </Badge>
                  <Button
                    variant="subtle"
                    color="white"
                    size="sm"
                    onClick={() => setDetailsOpened(false)}
                    style={{ color: 'white' }}
                  >
                    <IconX size={20} />
                  </Button>
                </Group>
                
                <Title order={2} mb="sm" style={{ color: 'white' }}>
                  {selectedProgram.name}
                </Title>
                
                <Text size="lg" style={{ color: 'rgba(255,255,255,0.9)' }} mb="md">
                  {selectedProgram.desc}
                </Text>
                
                <Group gap="md">
                  <Badge size="lg" variant="white" color={selectedProgram.color}>
                    {selectedProgram.level}
                  </Badge>
                </Group>
              </div>
              
              {/* Decorative background pattern */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  zIndex: 1
                }}
              />
            </div>

            {/* Content */}
            <div style={{ padding: '2rem' }}>
              <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack gap="xl">
                    {/* Objective */}
                    <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#f8f9fa' }}>
                      <Group gap="md" mb="md">
                        <ThemeIcon size="lg" color={selectedProgram.color} variant="light">
                          <IconTarget size={20} />
                        </ThemeIcon>
                        <Title order={4} style={{ color: '#153e6d' }}>Mục tiêu chương trình</Title>
                      </Group>
                      <Text>{selectedProgram.details.objective}</Text>
                    </Paper>

                    {/* Content */}
                    <div>
                      <Group gap="md" mb="md">
                        <ThemeIcon size="lg" color={selectedProgram.color} variant="light">
                          <IconClipboardList size={20} />
                        </ThemeIcon>
                        <Title order={4} style={{ color: '#153e6d' }}>Nội dung chi tiết</Title>
                      </Group>
                      <List
                        spacing="sm"
                        size="md"
                        center
                        icon={
                          <ThemeIcon color={selectedProgram.color} size={24} radius="xl">
                            <IconCheck size={14} />
                          </ThemeIcon>
                        }
                      >
                        {selectedProgram.details.content.map((item, index) => (
                          <List.Item key={index}>
                            <Text fw={500}>{item}</Text>
                          </List.Item>
                        ))}
                      </List>
                    </div>

                    {/* Benefits */}
                    <div>
                      <Group gap="md" mb="md">
                        <ThemeIcon size="lg" color="green" variant="light">
                          <IconBulb size={20} />
                        </ThemeIcon>
                        <Title order={4} style={{ color: '#153e6d' }}>Lợi ích khi hoàn thành</Title>
                      </Group>
                      <List
                        spacing="sm"
                        size="md"
                        center
                        icon={
                          <ThemeIcon color="green" size={24} radius="xl">
                            <IconCheck size={14} />
                          </ThemeIcon>
                        }
                      >
                        {selectedProgram.details.benefits.map((benefit, index) => (
                          <List.Item key={index}>
                            <Text fw={500}>{benefit}</Text>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap="md">
                    {/* Requirements */}
                    <Paper p="lg" withBorder radius="md" style={{ backgroundColor: '#fff8e1' }}>
                      <Group gap="md" mb="md">
                        <ThemeIcon size="md" color="orange" variant="light">
                          <IconBookmark size={16} />
                        </ThemeIcon>
                        <Title order={5}>Yêu cầu đầu vào</Title>
                      </Group>
                      <Text size="sm">{selectedProgram.details.requirements}</Text>
                    </Paper>

                    {/* Certification */}
                    <Paper p="lg" withBorder radius="md" style={{ backgroundColor: '#e8f5e8' }}>
                      <Group gap="md" mb="md">
                        <ThemeIcon size="md" color="green" variant="light">
                          <IconAward size={16} />
                        </ThemeIcon>
                        <Title order={5}>Chứng chỉ nhận được</Title>
                      </Group>
                      <Text size="sm" fw={600} c="green">
                        {selectedProgram.details.certification}
                      </Text>
                    </Paper>

                    {/* Info Alert */}
                    <Alert 
                      color="blue" 
                      variant="light" 
                      icon={<IconInfoCircle size={16} />}
                      title="Lưu ý quan trọng"
                    >
                      <Text size="sm">
                        Chương trình ICDL được triển khai thông qua các trường đối tác. 
                        Vui lòng liên hệ để biết thêm thông tin về cách đăng ký tại trường của con em bạn.
                      </Text>
                    </Alert>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Divider my="xl" />

              {/* Action Button */}
              <Group justify="center">
                <Button 
                  size="lg"
                  color={selectedProgram.color}
                  leftSection={<IconPhone size={20} />}
                  onClick={() => {
                    setDetailsOpened(false);
                    handleRequestConsultation(selectedProgram);
                  }}
                  style={{ minWidth: '200px' }}
                >
                  Tư vấn chương trình này
                </Button>
              </Group>
            </div>
          </div>
        )}
      </Modal>

      {/* Consultation Modal */}
      <Modal
        opened={consultationOpened}
        onClose={() => setConsultationOpened(false)}
        title={selectedProgramForConsultation ? 
          `Tư vấn: ${selectedProgramForConsultation.name}` : 
          "Đăng ký tư vấn chương trình ICDL"
        }
        size="md"
        centered
      >
        <form onSubmit={consultationForm.onSubmit(handleConsultationSubmit)}>
          <Stack gap="md">
            {selectedProgramForConsultation && (
              <Alert color="blue" variant="light">
                <Text size="sm">
                  Bạn đang quan tâm đến: <strong>{selectedProgramForConsultation.name}</strong>
                </Text>
              </Alert>
            )}

            <TextInput
              label="Họ và tên"
              placeholder="Nhập họ tên của bạn"
              leftSection={<IconUser size={16} />}
              required
              {...consultationForm.getInputProps('fullName')}
            />

            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              leftSection={<IconPhone size={16} />}
              required
              {...consultationForm.getInputProps('phone')}
            />

            <TextInput
              label="Email"
              placeholder="Nhập email của bạn"
              leftSection={<IconMail size={16} />}
              required
              {...consultationForm.getInputProps('email')}
            />

            <TextInput
              label="Trường/Tổ chức"
              placeholder="Tên trường học hoặc tổ chức (nếu có)"
              leftSection={<IconSchool size={16} />}
              {...consultationForm.getInputProps('organization')}
            />

            <Select
              label="Loại tư vấn"
              placeholder="Chọn nội dung bạn muốn tư vấn"
              data={[
                { value: 'general', label: 'Tư vấn chung về ICDL' },
                { value: 'school', label: 'Triển khai ICDL tại trường' },
                { value: 'curriculum', label: 'Chương trình đào tạo' },
                { value: 'certification', label: 'Quy trình cấp chứng chỉ' },
                { value: 'partnership', label: 'Hợp tác đối tác' },
                { value: 'other', label: 'Khác' }
              ]}
              {...consultationForm.getInputProps('inquiryType')}
            />

            <Textarea
              label="Nội dung chi tiết"
              placeholder="Mô tả chi tiết về những gì bạn muốn tư vấn (không bắt buộc)"
              rows={4}
              {...consultationForm.getInputProps('message')}
            />

            <Button 
              type="submit" 
              color="blue" 
              size="lg" 
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu tư vấn'}
            </Button>

            <Text size="xs" c="dimmed" ta="center">
              Chúng tôi cam kết bảo mật thông tin và sẽ liên hệ với bạn trong vòng 24 giờ
            </Text>
          </Stack>
        </form>
      </Modal>
      
      <Footer />
    </div>
  );
} 